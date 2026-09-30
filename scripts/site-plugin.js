// Vite plugin that fills in the page <head> from src/config/site.js and, at build time,
// writes one HTML file per page so every URL is served directly with its own title and
// description (and a 200 status on GitHub Pages instead of a 404.html fallback).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import site from '../src/config/site.js'
import people from '../src/content/people.js'
import research from '../src/content/research.js'

const START = '<!--site-head-->'
const END = '<!--/site-head-->'

function escape(text = '') {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function firstParagraph(value) {
  return Array.isArray(value) ? value[0] : value
}

function truncate(text, max = 160) {
  if (!text || text.length <= max) return text
  return text.slice(0, text.lastIndexOf(' ', max - 1)) + '…'
}

function siteUrl(path) {
  return site.url ? site.url.replace(/\/$/, '') + (path === '/' ? '/' : path) : null
}

function head({ title, description, path, base }) {
  const fullTitle = title ? `${title} | ${site.name}` : site.name
  const url = siteUrl(path)
  const image = site.ogImage && (/^https?:/.test(site.ogImage) ? site.ogImage : siteUrl('/' + site.ogImage.replace(/^\//, '')))
  const { theme } = site

  const tags = [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(description)}" />`,
    `<meta property="og:site_name" content="${escape(site.name)}" />`,
    `<meta property="og:title" content="${escape(fullTitle)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:type" content="website" />`,
    url && `<meta property="og:url" content="${escape(url)}" />`,
    url && `<link rel="canonical" href="${escape(url)}" />`,
    image && `<meta property="og:image" content="${escape(image)}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />`,
    `<link rel="icon" href="${base}${escape(site.favicon || 'favicon.svg')}" />`,
    `<style>:root{--accent-light:${theme.accent};--accent-dark:${theme.accentDark || theme.accent};--font-body:${theme.font}}</style>`,
    // Apply the saved or default color mode before first paint to avoid a flash.
    `<script>try{var m=localStorage.getItem('color-mode')||${JSON.stringify(theme.defaultMode || 'system')};` +
      `if(m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}</script>`,
  ]
  return START + '\n    ' + tags.filter(Boolean).join('\n    ') + '\n    ' + END
}

function pages() {
  const enabled = new Set(site.nav.map((item) => item.page))
  const list = [{ path: '/', description: site.description }]
  for (const item of site.nav) {
    list.push({ path: `/${item.page}`, title: item.label, description: site.description })
  }
  if (enabled.has('people')) {
    for (const p of people) {
      const summary = [p.name, p.role].filter(Boolean).join(', ')
      const bio = firstParagraph(p.bio)
      list.push({ path: `/people/${p.id}`, title: p.name, description: truncate(bio ? `${summary}. ${bio}` : summary) })
    }
  }
  if (enabled.has('research')) {
    for (const r of research) {
      list.push({ path: `/research/${r.id}`, title: r.title, description: truncate(r.summary || firstParagraph(r.description)) || site.description })
    }
  }
  return list
}

export default function sitePlugin() {
  let outDir
  let base

  return {
    name: 'site-pages',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      base = config.base
    },
    transformIndexHtml(html) {
      return html
        .replace(/<html lang="[^"]*">/, `<html lang="${escape(site.locale || 'en')}">`)
        .replace(/<!--site-head-->[\s\S]*?<!--\/site-head-->/, head({ path: '/', description: site.description, base }))
    },
    closeBundle() {
      if (!outDir) return
      const template = readFileSync(resolve(outDir, 'index.html'), 'utf8')
      const render = (page) => template.replace(/<!--site-head-->[\s\S]*?<!--\/site-head-->/, head({ ...page, base }))

      // /people/alex-rivera is written as people/alex-rivera.html, which GitHub Pages,
      // Netlify and Cloudflare Pages all serve at the extensionless URL.
      // Menu pages also get <page>/index.html, because some hosts redirect /people to
      // /people/ when a people/ folder exists (it holds the profile pages).
      const menuPaths = new Set(site.nav.map((item) => `/${item.page}`))
      for (const page of pages()) {
        if (page.path === '/') continue
        const files = [page.path.slice(1) + '.html']
        if (menuPaths.has(page.path)) files.push(page.path.slice(1) + '/index.html')
        for (const name of files) {
          const file = resolve(outDir, name)
          mkdirSync(dirname(file), { recursive: true })
          writeFileSync(file, render(page))
        }
      }
      // Fallback for any other URL; the app shows its "Page not found" view.
      writeFileSync(resolve(outDir, '404.html'), render({ path: '/404', title: 'Page not found', description: site.description }))

      if (site.url) {
        const urls = pages().map((p) => `  <url><loc>${escape(siteUrl(p.path))}</loc></url>`)
        writeFileSync(
          resolve(outDir, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
        )
        writeFileSync(resolve(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl('/sitemap.xml')}\n`)
      }
    },
  }
}
