// Vite plugin that
//   - serves everything in content/ to the app as `virtual:content` (reloading on edits),
//   - fills in the page <head> from src/config/site.js (title, meta tags, colors, analytics),
//   - at build time writes one HTML file per page, so every URL is served directly with
//     its own title and description, plus sitemap.xml, robots.txt, the news RSS feed and
//     the events calendar files.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import site, { navPages, pageEnabled } from '../src/config/index.js'
import { CONTENT_DIR, loadContent } from './content.js'
import { eventsIcs, newsRss } from './feeds.js'

const VIRTUAL_ID = 'virtual:content'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const HEAD = /<!--site-head-->[\s\S]*?<!--\/site-head-->/

function escape(text = '') {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function truncate(text, max = 160) {
  if (!text || text.length <= max) return text
  return text.slice(0, text.lastIndexOf(' ', max - 1)) + '…'
}

function absoluteUrl(path) {
  return site.url ? site.url.replace(/\/$/, '') + (path === '/' ? '/' : path) : null
}

function analyticsTags() {
  const { plausible, umami, googleAnalytics } = site.analytics || {}
  const tags = []
  if (plausible?.domain) {
    tags.push(`<script defer data-domain="${escape(plausible.domain)}" src="${escape(plausible.src)}"></script>`)
  }
  if (umami?.websiteId) {
    tags.push(`<script defer data-website-id="${escape(umami.websiteId)}" src="${escape(umami.src)}"></script>`)
  }
  if (googleAnalytics) {
    const id = escape(googleAnalytics)
    tags.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`,
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}')</script>`,
    )
  }
  return tags
}

function head({ title, description, path, base }) {
  const fullTitle = title ? `${title} | ${site.name}` : site.name
  const url = absoluteUrl(path)
  const image =
    site.ogImage && (/^https?:/.test(site.ogImage) ? site.ogImage : absoluteUrl('/' + site.ogImage.replace(/^\//, '')))
  const { theme } = site
  const rss = pageEnabled('news') && site.news.rss && site.url

  const tags = [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(description || site.description)}" />`,
    `<meta property="og:site_name" content="${escape(site.name)}" />`,
    `<meta property="og:title" content="${escape(fullTitle)}" />`,
    `<meta property="og:description" content="${escape(description || site.description)}" />`,
    `<meta property="og:type" content="website" />`,
    url && `<meta property="og:url" content="${escape(url)}" />`,
    url && `<link rel="canonical" href="${escape(url)}" />`,
    image && `<meta property="og:image" content="${escape(image)}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />`,
    `<link rel="icon" href="${base}${escape(site.favicon || 'favicon.svg')}" />`,
    rss && `<link rel="alternate" type="application/rss+xml" title="${escape(site.name)}" href="${base}news.xml" />`,
    `<style>:root{--accent-light:${theme.accent};--accent-dark:${theme.accentDark || theme.accent};--font-body:${theme.font}}</style>`,
    // Apply the saved or default color mode before first paint to avoid a flash.
    `<script>try{var m=localStorage.getItem('color-mode')||${JSON.stringify(theme.defaultMode || 'system')};` +
      `if(m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}</script>`,
    ...analyticsTags(),
  ]
  return '<!--site-head-->\n    ' + tags.filter(Boolean).join('\n    ') + '\n    <!--/site-head-->'
}

// Every URL on the site with its title and description.
function pageList(content) {
  const list = [{ path: '/', description: site.description }]
  for (const { page, label } of navPages) {
    if (page === 'home') continue
    list.push({ path: `/${page}`, title: site[page]?.title || label, description: site.description })
  }
  if (pageEnabled('people')) {
    for (const p of content.people) {
      const summary = [p.name, p.role].filter(Boolean).join(', ')
      list.push({
        path: `/people/${p.id}`,
        title: p.name,
        description: truncate(p.excerpt ? `${summary}. ${p.excerpt}` : summary),
      })
    }
  }
  if (pageEnabled('research')) {
    for (const r of content.research)
      list.push({ path: `/research/${r.id}`, title: r.title, description: truncate(r.excerpt) })
  }
  if (pageEnabled('news')) {
    for (const n of content.news.filter((n) => n.hasPage)) {
      list.push({ path: `/news/${n.id}`, title: n.title || n.text, description: truncate(n.text) })
    }
  }
  if (pageEnabled('events')) {
    for (const e of content.events.filter((e) => e.hasPage)) {
      list.push({ path: `/events/${e.id}`, title: e.title, description: truncate(e.summary || e.title) })
    }
  }
  return list
}

export default function sitePlugin() {
  let outDir
  let base = '/'
  let content = null

  const write = (name, data) => {
    const file = resolve(outDir, name)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, data)
  }

  return {
    name: 'site-pages',

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      base = config.base
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    async load(id) {
      if (id !== RESOLVED_ID) return
      content = await loadContent(site, base)
      return `export default ${JSON.stringify(content)}`
    },

    // Edits in content/ reload the page in the dev server.
    configureServer(server) {
      // Serve the content editor at /admin/ in development too.
      server.middlewares.use((req, _res, next) => {
        if (/^\/admin\/?(\?.*)?$/.test(req.url)) req.url = '/admin/index.html'
        next()
      })
      server.watcher.add(CONTENT_DIR)
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(CONTENT_DIR)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },

    transformIndexHtml(html) {
      return html
        .replace(/<html lang="[^"]*">/, `<html lang="${escape(site.locale || 'en')}">`)
        .replace(HEAD, head({ path: '/', description: site.description, base }))
    },

    async closeBundle() {
      if (!outDir) return
      content ||= await loadContent(site, base)
      const template = readFileSync(resolve(outDir, 'index.html'), 'utf8')
      const render = (page) => template.replace(HEAD, head({ ...page, base }))

      // /people/alex-rivera is written as people/alex-rivera.html, which GitHub Pages,
      // Netlify and Cloudflare Pages all serve at the extensionless URL. Menu pages also
      // get <page>/index.html, because some hosts redirect /people to /people/ when a
      // people/ folder exists.
      const pages = pageList(content)
      const menuPaths = new Set(navPages.map((p) => `/${p.page}`))
      for (const page of pages) {
        if (page.path === '/') continue
        write(page.path.slice(1) + '.html', render(page))
        if (menuPaths.has(page.path)) write(page.path.slice(1) + '/index.html', render(page))
      }
      // Fallback for any other URL; the app shows its "Page not found" view.
      write('404.html', render({ path: '/404', title: 'Page not found' }))

      const host = site.url ? new URL(site.url).host : 'localhost'
      const absolute = (path) => absoluteUrl(path) || path

      if (pageEnabled('events')) {
        write('events.ics', eventsIcs({ site, events: content.events, absolute, host }))
        for (const event of content.events) {
          write(`events/${event.id}.ics`, eventsIcs({ site, events: [event], absolute, host }))
        }
      }

      if (site.url) {
        if (pageEnabled('news') && site.news.rss) write('news.xml', newsRss({ site, news: content.news, absolute }))
        const urls = pages.map((p) => `  <url><loc>${escape(absoluteUrl(p.path))}</loc></url>`)
        write(
          'sitemap.xml',
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
        )
        write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`)
      }
    },
  }
}
