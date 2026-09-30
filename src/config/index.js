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

const enabledPages = new Set(site.nav.map((item) => item.page))

// Whether a page exists on the site (listed in `nav`, shown in the menu or not).
export function pageEnabled(page) {
  return enabledPages.has(page)
}

export const menuItems = site.nav.filter((item) => item.menu !== false)

// Whether a `sections` list includes a section. A missing list means "show everything".
export function hasSection(sections, name) {
  return !sections || sections.includes(name)
}
