// Runs after `vite build` (see the build script in package.json). For every page on the
// site it writes an HTML file containing the rendered page and its own <head> (title,
// description, social image, Google Scholar tags, structured data), then the sitemap,
// robots.txt, news RSS feed, event calendar files, social images and resized photos.
//
// /people/alex-rivera is written as people/alex-rivera.html, which GitHub Pages, Netlify
// and Cloudflare Pages all serve at the extensionless URL. Menu pages also get
// <page>/index.html, because some hosts redirect /people to /people/ when a people/ folder
// exists.
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import site, { navPages, pageEnabled } from '../src/config/index.js'
import { eventsIcs, newsRss } from './feeds.js'
import { absoluteUrl, escape, head, pageList } from './head.js'
import { imageCacheFile } from './images.js'
import { writeSocialImage } from './og.js'

const ROOT = resolve(import.meta.dirname, '..')
const DIST = resolve(ROOT, 'dist')
const SSR_DIR = resolve(ROOT, '.ssr')
const HEAD = /<!--site-head-->[\s\S]*?<!--\/site-head-->/
const base = process.env.BASE_PATH || '/'

const { render, content } = await import(pathToFileURL(resolve(SSR_DIR, 'entry-server.js')).href)
const template = readFileSync(resolve(DIST, 'index.html'), 'utf8')
const prerender = site.router !== 'hash'

const write = (name, data) => {
  const file = resolve(DIST, name)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, data)
}

function slug(path) {
  return path === '/' ? 'index' : path.slice(1).replace(/\//g, '--')
}

function renderPage(page) {
  let html = template.replace(HEAD, head({ ...page, base }))
  if (prerender) {
    const body = render(base.replace(/\/$/, '') + page.path)
    html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  }
  return html
}

const pages = pageList(content)
const host = site.url ? new URL(site.url).host : ''
const makeImages = site.socialImages && site.url

let count = 0
for (const page of pages) {
  if (makeImages && !page.image && page.og) {
    const file = `og/${slug(page.path)}.png`
    writeSocialImage(resolve(DIST, file), { ...page.og, siteName: site.name, host, accent: site.theme.accent })
    page.image = file
  }
  const html = renderPage(page)
  if (page.path === '/') write('index.html', html)
  else {
    write(page.path.slice(1) + '.html', html)
    if (navPages.some((p) => `/${p.page}` === page.path)) write(page.path.slice(1) + '/index.html', html)
  }
  count++
}
// Any other URL gets the "Page not found" view.
write('404.html', renderPage({ path: '/404', title: 'Page not found' }))

// Resized photos used by the content.
let images = 0
for (const info of Object.values(content.images || {})) {
  for (const v of info.variants) {
    const name = v.url.split('/').pop()
    const target = resolve(DIST, '_img', name)
    if (!existsSync(target)) {
      mkdirSync(dirname(target), { recursive: true })
      copyFileSync(imageCacheFile(name), target)
      images++
    }
  }
}

const absolute = (path) => absoluteUrl(path) || path
if (pageEnabled('events')) {
  write('events.ics', eventsIcs({ site, events: content.events, absolute, host: host || 'localhost' }))
  for (const event of content.events) {
    write(`events/${event.id}.ics`, eventsIcs({ site, events: [event], absolute, host: host || 'localhost' }))
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

rmSync(SSR_DIR, { recursive: true, force: true })
console.log(`[prerender] ${count} pages, ${images} resized images${makeImages ? ', social images' : ''}`)
