import { useNavigate } from 'react-router'

// Renders HTML produced from Markdown at build time (content/ files are written by the
// lab, so the HTML is trusted). Clicks on links to other pages of this site are handled
// by the router instead of reloading the page.
export default function Markdown({ html, className = '' }) {
  const navigate = useNavigate()
  if (!html) return null

  const onClick = (e) => {
    const a = e.target.closest('a')
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    const url = new URL(a.href, window.location.href)
    if (url.origin !== window.location.origin) return
    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    if (base && !url.pathname.startsWith(base)) return
    e.preventDefault()
    navigate(url.pathname.slice(base.length) + url.search + url.hash)
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      onClick={onClick}
      className={`prose max-w-2xl prose-neutral dark:prose-invert prose-a:text-accent prose-a:decoration-accent/30 prose-a:underline-offset-2 hover:prose-a:decoration-accent prose-headings:font-semibold prose-img:rounded-md ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
