import site from '../config/index.js'

// Resolve a path in public/ against the deploy base. Full URLs pass through.
export function asset(path) {
  if (!path) return path
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

export function paragraphs(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export function formatDate(iso, style = 'medium') {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, (m || 1) - 1, d || 1))
  const options =
    style === 'short'
      ? { year: 'numeric', month: 'short', timeZone: 'UTC' }
      : { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
  return date.toLocaleDateString(site.locale || 'en-US', options)
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function isExternal(url) {
  return /^(https?:)?\/\//.test(url) || url.startsWith('mailto:')
}
