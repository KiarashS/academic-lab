// Resizes the site's photos at build time. Each JPEG/PNG/WebP/AVIF in public/ that the
// content uses gets WebP copies at a few widths; the app picks the right one with srcset,
// so a 6 MB phone photo isn't sent to a phone. SVGs, GIFs and images on other sites are
// left as they are. Resized files are cached (see cache.js) and copied to dist/_img/.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import sharp from 'sharp'
import { cachePath } from './cache.js'

export const PUBLIC_DIR = resolve(import.meta.dirname, '../public')
export const IMAGE_URL_PREFIX = '/_img/'
const WIDTHS = [400, 800, 1200, 1600, 2400]
const RASTER = /\.(jpe?g|png|webp|avif)$/i

export function imageCacheFile(name) {
  return cachePath('img', name)
}

// '/uploads/a.jpg' and 'uploads/a.jpg' are the same image.
export function imageKey(src) {
  return String(src).replace(/^\//, '').split(/[?#]/)[0]
}

async function processOne(src) {
  const key = imageKey(src)
  if (!RASTER.test(key)) return null
  const file = join(PUBLIC_DIR, key)
  if (!existsSync(file)) return null

  const buffer = readFileSync(file)
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 12)
  const meta = await sharp(buffer).metadata()
  // Photos from phones often store their rotation separately; account for it.
  const rotated = meta.orientation >= 5
  const width = rotated ? meta.height : meta.width
  const height = rotated ? meta.width : meta.height
  const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, WIDTHS.at(-1))])]

  const variants = []
  for (const w of widths) {
    const name = `${hash}-${w}.webp`
    const out = imageCacheFile(name)
    if (!existsSync(out)) {
      await sharp(buffer).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out)
    }
    variants.push({ url: IMAGE_URL_PREFIX + name, width: w })
  }
  return { width, height, variants }
}

// Returns { 'uploads/a.jpg': { width, height, variants: [{ url, width }] } } for every
// image that could be resized.
export async function processImages(srcs) {
  const out = {}
  for (const src of new Set(srcs.filter(Boolean).filter((s) => !/^(https?:)?\/\//.test(s)))) {
    try {
      const info = await processOne(src)
      if (info) out[imageKey(src)] = info
    } catch (error) {
      console.warn(`[images] Could not resize ${src}: ${error.message}`)
    }
  }
  return out
}

// <img> tags inside Markdown bodies get srcset, size and lazy loading too.
export function enhanceHtmlImages(html, images, base) {
  return html.replace(/<img ([^>]*?)src="([^"]+)"([^>]*)>/g, (tag, before, src, after) => {
    const key = imageKey(src.startsWith(base) ? src.slice(base.length) : src)
    const info = images[key]
    const lazy = /loading=/.test(tag) ? '' : ' loading="lazy" decoding="async"'
    if (!info) return `<img ${before}src="${src}"${after.replace(/\/?$/, '')}${lazy}>`
    const srcset = info.variants.map((v) => `${base}${v.url.slice(1)} ${v.width}w`).join(', ')
    return `<img ${before}src="${src}" srcset="${srcset}" sizes="(min-width: 768px) 42rem, 100vw" width="${info.width}" height="${info.height}"${after.replace(/\/?$/, '')}${lazy}>`
  })
}
