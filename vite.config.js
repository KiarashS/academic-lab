import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitePlugin from './scripts/site-plugin.js'

// BASE_PATH is the path the site is served from: '/' for a custom domain or
// <user>.github.io, '/<repo>/' for a GitHub Pages project site.
// The GitHub Pages workflow sets it automatically.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss(), sitePlugin()],
})
