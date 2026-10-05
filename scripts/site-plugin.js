// Vite plugin that
//   - serves everything in content/ to the app as `virtual:content` (reloading on edits),
//   - fills in the default page <head> from src/config/site.js,
//   - serves the content editor (/admin) and resized photos (/_img) in the dev server.
// Writing the per-page HTML files, feeds and sitemap happens after the build, in
// scripts/prerender.js.
import { existsSync, readFileSync } from 'node:fs'
import site from '../src/config/index.js'
import { CONTENT_DIR, loadContent } from './content.js'
import { makeFavicons } from './favicons.js'
import { head } from './head.js'
import { IMAGE_URL_PREFIX, imageCacheFile } from './images.js'

const VIRTUAL_ID = 'virtual:content'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const HEAD = /<!--site-head-->[\s\S]*?<!--\/site-head-->/

// Today in the lab's time zone, used for "upcoming events" and the copyright year.
function buildDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: site.events.timezone || 'UTC' }).format(new Date())
}

export default function sitePlugin() {
  let base = '/'
  let ssr = false
  let favicons = null // made once per dev server or build
  const getFavicons = () => (favicons ||= makeFavicons(base))

  return {
    name: 'site-pages',

    config(_config, { isSsrBuild }) {
      ssr = Boolean(isSsrBuild)
      return {
        define: { __BUILD_DATE__: JSON.stringify(buildDate()) },
        // The server-side build only renders pages; public/ is copied by the browser build.
        build: isSsrBuild ? { copyPublicDir: false } : {},
      }
    },

    configResolved(config) {
      base = config.base
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    // favicon.ico, the PNG icons and site.webmanifest, made from the `favicon` image.
    async generateBundle() {
      if (ssr) return
      for (const [fileName, source] of Object.entries(await getFavicons())) {
        this.emitFile({ type: 'asset', fileName, source })
      }
    },

    async load(id) {
      if (id !== RESOLVED_ID) return
      return `export default ${JSON.stringify(await loadContent(site, base))}`
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const name = req.url.split('?')[0].slice(base.length)
        if (/^(favicon\.ico|icon-[\w-]+\.png|apple-touch-icon\.png|site\.webmanifest)$/.test(name)) {
          const file = (await getFavicons())[name]
          if (file) {
            const types = { ico: 'image/x-icon', png: 'image/png', webmanifest: 'application/manifest+json' }
            res.setHeader('Content-Type', types[name.split('.').pop()])
            return res.end(file)
          }
        }
        // The content editor at /admin/.
        if (/^\/admin\/?(\?.*)?$/.test(req.url)) req.url = '/admin/index.html'
        // Resized photos, straight from the cache.
        if (req.url.startsWith(IMAGE_URL_PREFIX)) {
          const file = imageCacheFile(req.url.slice(IMAGE_URL_PREFIX.length).split('?')[0])
          if (existsSync(file)) {
            res.setHeader('Content-Type', 'image/webp')
            return res.end(readFileSync(file))
          }
        }
        next()
      })
      // Edits in content/ reload the page.
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
        .replace(/<html lang="[^"]*">/, `<html lang="${site.locale || 'en'}">`)
        .replace(HEAD, head({ path: '/', description: site.description, base }))
    },
  }
}
