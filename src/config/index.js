// The settings the site actually uses: site.js layered over defaults.js.
// Import from here, not from site.js.
import defaults from './defaults.js'
import userSite from './site.js'

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Objects merge key by key; arrays, strings, numbers and null replace the default.
function merge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return override === undefined ? base : override
  const out = { ...base }
  for (const [key, value] of Object.entries(override)) out[key] = merge(base[key], value)
  return out
}

const site = merge(defaults, userSite)
export default site

// Every page listed in `nav`, including those inside groups and those hidden from the menu.
export const navPages = site.nav.flatMap((item) => (item.items ? item.items : [item])).filter((item) => item.page)

const enabledPages = new Set(navPages.map((item) => item.page))

// Whether a page exists on the site (listed in `nav`, shown in the menu or not).
export function pageEnabled(page) {
  return enabledPages.has(page)
}

// The menu: pages and groups ({ label, items }) minus anything with `menu: false`.
export const menuItems = site.nav
  .filter((item) => item.menu !== false)
  .map((item) => (item.items ? { ...item, items: item.items.filter((i) => i.menu !== false) } : item))
  .filter((item) => !item.items || item.items.length > 0)

export function pagePath(page) {
  return page === 'home' ? '/' : `/${page}`
}

// Whether a `sections` list includes a section. A missing list means "show everything".
export function hasSection(sections, name) {
  return !sections || sections.includes(name)
}
