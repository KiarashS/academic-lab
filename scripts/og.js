// Social preview images: a 1200x630 PNG per page with the page title, a subtitle and the
// lab's name, shown when a link is shared on social media or in chat apps. Rendered from
// SVG with the DejaVu fonts from npm, so the result is the same on every machine.
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { cachePath } from './cache.js'

const FONT_DIR = resolve(import.meta.dirname, '../node_modules/dejavu-fonts-ttf/ttf')
const FONTS = ['DejaVuSans.ttf', 'DejaVuSans-Bold.ttf'].map((f) => join(FONT_DIR, f))
const W = 1200
const H = 630

function xml(text = '') {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

// Greedy word wrap by an estimated character width; adds "…" if it runs out of lines.
function wrap(text, maxChars, maxLines) {
  const lines = []
  let line = ''
  for (const word of String(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (next.length <= maxChars) line = next
    else {
      if (line) lines.push(line)
      line = word.length > maxChars ? word.slice(0, maxChars - 1) + '…' : word
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s*\S*$/, '') + '…'
    return kept
  }
  return lines
}

function svg({ title, subtitle, siteName, host, accent }) {
  const big = title.length < 40
  const size = big ? 68 : 54
  // DejaVu Sans Bold averages about 0.64em per character; the text area is 1040px wide.
  const titleLines = wrap(title, Math.floor(1040 / (0.64 * size)), 4)
  const subLines = subtitle ? wrap(subtitle, Math.floor(1040 / (0.58 * 30)), 2) : []
  const titleTop = 220
  const lineHeight = size * 1.2
  const subTop = titleTop + titleLines.length * lineHeight + 20

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${xml(accent)}"/>
  <text x="80" y="120" font-family="DejaVu Sans" font-weight="700" font-size="32" fill="#171717">${xml(siteName)}</text>
  ${titleLines
    .map(
      (l, i) =>
        `<text x="80" y="${titleTop + i * lineHeight}" font-family="DejaVu Sans" font-weight="700" font-size="${size}" fill="#0a0a0a">${xml(l)}</text>`,
    )
    .join('\n  ')}
  ${subLines
    .map(
      (l, i) =>
        `<text x="80" y="${subTop + i * 40}" font-family="DejaVu Sans" font-size="30" fill="#525252">${xml(l)}</text>`,
    )
    .join('\n  ')}
  ${host ? `<text x="80" y="${H - 60}" font-family="DejaVu Sans" font-size="26" fill="${xml(accent)}">${xml(host)}</text>` : ''}
</svg>`
}

// Writes the image for one page to `outFile` (reusing a cached copy when nothing changed).
export function writeSocialImage(outFile, data) {
  const source = svg(data)
  const hash = createHash('sha1').update(source).digest('hex').slice(0, 16)
  const cached = cachePath('og', `${hash}.png`)
  if (!existsSync(cached)) {
    const png = new Resvg(source, {
      font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'DejaVu Sans' },
      fitTo: { mode: 'width', value: W },
    })
      .render()
      .asPng()
    writeFileSync(cached, png)
  }
  mkdirSync(dirname(outFile), { recursive: true })
  copyFileSync(cached, outFile)
}
