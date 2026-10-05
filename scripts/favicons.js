// Makes every icon browsers and phones look for from the one image in `favicon`
// (src/config/site.js): favicon.ico for old browsers and tools, PNGs for Android and the
// web app manifest, and apple-touch-icon.png for iPhone and iPad home screens. An SVG
// source is also linked as it is, for browsers that draw SVG icons sharply at any size.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import site from '../src/config/index.js'
import { PUBLIC_DIR } from './images.js'

export function faviconSource() {
  const name = String(site.favicon || '').replace(/^\//, '')
  const file = name && join(PUBLIC_DIR, name)
  return file && existsSync(file) ? { name, file, svg: /\.svg$/i.test(name) } : null
}

const png = (source, size, { background, padding = 0 } = {}) => {
  const inner = Math.round(size * (1 - 2 * padding))
  const icon = sharp(source, { density: 600 }).resize(inner, inner, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  if (!padding && !background) return icon.png().toBuffer()
  return icon
    .png()
    .toBuffer()
    .then((buffer) =>
      sharp({
        create: { width: size, height: size, channels: 4, background: background || { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: buffer, gravity: 'center' }])
        .png()
        .toBuffer(),
    )
}

// An .ico file is a small header followed by PNG images.
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i
    header.writeUInt8(size >= 256 ? 0 : size, at)
    header.writeUInt8(size >= 256 ? 0 : size, at + 1)
    header.writeUInt16LE(1, at + 4) // color planes
    header.writeUInt16LE(32, at + 6) // bits per pixel
    header.writeUInt32LE(data.length, at + 8)
    header.writeUInt32LE(offset, at + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map((i) => i.data)])
}

// { 'favicon.ico': Buffer, 'icon-192.png': Buffer, ... }, or {} without a source image.
export async function makeFavicons(base = '/') {
  const source = faviconSource()
  if (!source) return {}
  const input = readFileSync(source.file)
  const background = site.faviconBackground || '#ffffff'
  const small = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(input, size) })))
  const files = {
    'favicon.ico': ico(small),
    'icon-192.png': await png(input, 192),
    'icon-512.png': await png(input, 512),
    // Android crops "maskable" icons to a circle or squircle, so the image sits inside a
    // safe zone on a solid background.
    'icon-maskable-512.png': await png(input, 512, { background, padding: 0.12 }),
    // iOS fills transparent areas with black, so this one gets a background too.
    'apple-touch-icon.png': await png(input, 180, { background, padding: 0.08 }),
  }
  files['site.webmanifest'] = Buffer.from(
    JSON.stringify(
      {
        name: site.name,
        short_name: site.shortName || site.name,
        start_url: base,
        scope: base,
        display: 'browser',
        background_color: background,
        theme_color: site.theme.accent,
        icons: [
          { src: `${base}icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      null,
      2,
    ) + '\n',
  )
  return files
}

// The <head> tags for the icons above.
export function faviconTags(base, escape) {
  const source = faviconSource()
  if (!source) return []
  return [
    `<link rel="icon" href="${base}favicon.ico" sizes="48x48" />`,
    source.svg
      ? `<link rel="icon" href="${base}${escape(source.name)}" type="image/svg+xml" />`
      : `<link rel="icon" href="${base}icon-192.png" type="image/png" sizes="192x192" />`,
    `<link rel="apple-touch-icon" href="${base}apple-touch-icon.png" />`,
    `<link rel="manifest" href="${base}site.webmanifest" />`,
  ]
}
