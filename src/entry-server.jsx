// Used at build time only: renders a page to HTML (see scripts/prerender.js).
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App.jsx'

export { default as content } from 'virtual:content'

export function render(url) {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
  return renderToString(
    <StrictMode>
      <StaticRouter location={url} basename={basename}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
