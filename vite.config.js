import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// BASE_PATH controls where the built site is served from.
// './' works for any static host when the site uses hash routing (the default).
// With browser routing, set it to the deploy path, e.g. '/' or '/academic-lab/'.
export default defineConfig({
  base: process.env.BASE_PATH || './',
  plugins: [react(), tailwindcss()],
})
