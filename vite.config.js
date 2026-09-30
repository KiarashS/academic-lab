import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Static hosts serve 404.html for paths that don't exist as files. Making it a copy of
// index.html lets the router handle deep links such as /people/alex-rivera.
function spaFallback() {
  let outDir
  return {
    name: 'spa-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

// BASE_PATH is the path the site is served from: '/' for a custom domain or
// <user>.github.io, '/<repo>/' for a GitHub Pages project site.
// The GitHub Pages workflow sets it automatically.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), spaFallback()],
})
