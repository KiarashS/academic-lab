// A small on-disk cache for things fetched or generated at build time (ORCID records,
// citation counts, resized images, social images). It lives in node_modules/.cache, so a
// fresh checkout starts empty and nothing generated ends up in the repository.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const CACHE_DIR = resolve(import.meta.dirname, '../node_modules/.cache/academic-lab')

export function cachePath(...parts) {
  const path = join(CACHE_DIR, ...parts)
  mkdirSync(join(path, '..'), { recursive: true })
  return path
}

// Returns the cached JSON value if it is younger than `maxAgeHours`, otherwise runs
// `load`, stores the result and returns it. `load` returns undefined when it fails; with
// `keepOnError`, the last value stored is then used however old it is.
export async function cachedJson(name, maxAgeHours, load, { keepOnError = false } = {}) {
  const file = cachePath('json', `${name.replace(/[^a-z0-9-]+/gi, '_')}.json`)
  let cached
  if (existsSync(file)) {
    try {
      cached = JSON.parse(readFileSync(file, 'utf8'))
      if (Date.now() - cached.time < maxAgeHours * 3600 * 1000) return cached.value
    } catch {
      // Unreadable cache entry; fetch again.
    }
  }
  const value = await load()
  if (value !== undefined) writeFileSync(file, JSON.stringify({ time: Date.now(), value }))
  else if (keepOnError && cached) {
    const days = Math.round((Date.now() - cached.time) / 86400000)
    console.warn(`[cache] Using the last saved copy of ${name} (${days} day${days === 1 ? '' : 's'} old).`)
    return cached.value
  }
  return value
}
