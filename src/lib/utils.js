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

// "16 Feb 2026", or "16 Feb" without the year: day first, short month name in the
// site's language, as on the lab blog.
export function formatDayMonth(iso, withYear = true) {
  const [y, m, d] = iso.split('-').map(Number)
  const month = new Date(Date.UTC(y, (m || 1) - 1, 1)).toLocaleDateString(site.locale || 'en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
  return withYear ? `${d} ${month} ${y}` : `${d} ${month}`
}

function utcDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1))
}

// "Jun 2 – 3, 2026" for multi-day events, a single date otherwise.
export function formatDateRange(start, end) {
  if (!end || end === start) return formatDate(start)
  const fmt = new Intl.DateTimeFormat(site.locale || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return fmt.formatRange(utcDate(start), utcDate(end))
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
