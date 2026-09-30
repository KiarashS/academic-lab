import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router'
import App from './App.jsx'
import site from './config/index.js'
import './index.css'

// Colors, fonts, the page title and meta tags are written into index.html at build time
// by scripts/site-plugin.js.
const Router = site.router === 'hash' ? HashRouter : BrowserRouter
const basename = site.router === 'hash' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename={basename}>
      <App />
    </Router>
  </StrictMode>,
)
