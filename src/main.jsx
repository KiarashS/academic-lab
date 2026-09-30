import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router'
import App from './App.jsx'
import site from './config/site.js'
import './index.css'

const root = document.documentElement
root.style.setProperty('--accent-light', site.theme.accent)
root.style.setProperty('--accent-dark', site.theme.accentDark || site.theme.accent)
root.style.setProperty('--font-body', site.theme.font)

const description = document.createElement('meta')
description.name = 'description'
description.content = site.description
document.head.append(description)

const Router = site.router === 'browser' ? BrowserRouter : HashRouter
// A relative base ('./') has no meaning to the router, so treat it as the site root.
const base = import.meta.env.BASE_URL
const basename = site.router === 'browser' && base.startsWith('/') ? base.replace(/\/$/, '') || '/' : undefined

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename={basename}>
      <App />
    </Router>
  </StrictMode>,
)
