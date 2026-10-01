import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router'
import App from './App.jsx'
import site from './config/index.js'
import './index.css'

// Colors, fonts, the page title and meta tags are written into each page's HTML at build
// time (scripts/prerender.js). Built pages also contain the rendered page, which React
// takes over ("hydrates") here; the dev server starts from an empty page instead.
const Router = site.router === 'hash' ? HashRouter : BrowserRouter
const basename = site.router === 'hash' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

const app = (
  <StrictMode>
    <Router basename={basename}>
      <App />
    </Router>
  </StrictMode>
)

const root = document.getElementById('root')
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
