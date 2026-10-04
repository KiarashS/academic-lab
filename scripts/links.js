// `npm run links` (after `npm run build`): checks every link from the built site to other
// websites and lists the ones that no longer work. The nightly GitHub Action
// (.github/workflows/links.yml) runs it and keeps a "Broken links" issue up to date.
//
//   node scripts/links.js [--report report.md] [--json result.json]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import site from '../src/config/index.js'

const DIST = resolve(import.meta.dirname, '../dist')
const args = process.argv.slice(2)
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null)
const ownHost = site.url ? new URL(site.url).host : null
const ignore = site.linkCheck?.ignore || []

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'admin' ? [] : htmlFiles(path)
    return entry.name.endsWith('.html') ? [path] : []
  })
}

// Every external link and the pages it appears on. A page is written twice for menu pages
// (/talks.html and /talks/index.html), so pages are listed by their address.
const links = new Map()
for (const file of htmlFiles(DIST)) {
  let page =
    '/' +
    relative(DIST, file)
      .replace(/(index)?\.html$/, '')
      .replace(/\/$/, '')
  if (page === '/404') continue
  const html = readFileSync(file, 'utf8')
  for (const [, url] of html.matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)) {
    const clean = url.replace(/&amp;/g, '&')
    const host = new URL(clean).host
    if (host === ownHost || ignore.some((pattern) => clean.includes(pattern))) continue
    if (!links.has(clean)) links.set(clean, new Set())
    links.get(clean).add(page || '/')
  }
}

const HEADERS = {
  'user-agent': 'Mozilla/5.0 (compatible; academic-lab link check)',
  accept: 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8',
}

async function request(url, method) {
  const response = await fetch(url, {
    method,
    headers: HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })
  response.body?.cancel().catch(() => {})
  return response.status
}

// ok: works. blocked: the site refuses automated checks (common for LinkedIn, Google
// Scholar and some publishers), so it can't be judged. broken: missing or erroring.
async function check(url) {
  let status = null
  let error = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      status = await request(url, 'HEAD')
      // Some servers don't answer HEAD properly; ask again for the page itself.
      if (status >= 400) status = await request(url, 'GET')
      error = null
    } catch (e) {
      error = e.cause?.code || e.name || 'failed'
    }
    if (!error && status < 500) break
    await new Promise((done) => setTimeout(done, 3000))
  }
  if (error) return { url, result: 'broken', status: error }
  if (status < 400) return { url, result: 'ok', status }
  if ([401, 403, 429, 999].includes(status)) return { url, result: 'blocked', status }
  return { url, result: 'broken', status }
}

// A few at a time, so no single site gets flooded.
const queue = [...links.keys()]
const results = []
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) results.push(await check(queue.shift()))
  }),
)

const broken = results.filter((r) => r.result === 'broken').sort((a, b) => a.url.localeCompare(b.url))
const blocked = results.filter((r) => r.result === 'blocked').sort((a, b) => a.url.localeCompare(b.url))
const pagesOf = (url) => [...links.get(url)].sort()

const lines = [
  `The nightly link check found ${broken.length} broken link${broken.length === 1 ? '' : 's'} out of ${results.length} links to other websites.`,
  '',
  'Fix or remove each one in the file that holds it (usually in `content/`). This issue is updated every night and closes itself once every link works.',
  '',
  '| Link | Problem | On pages |',
  '| --- | --- | --- |',
  ...broken.map(
    (r) =>
      `| ${r.url} | ${r.status} | ${pagesOf(r.url).slice(0, 5).join(', ')}${pagesOf(r.url).length > 5 ? ', …' : ''} |`,
  ),
]
if (blocked.length) {
  lines.push(
    '',
    `<details><summary>${blocked.length} link${blocked.length === 1 ? '' : 's'} could not be checked (the site blocks automated requests)</summary>`,
    '',
    ...blocked.map((r) => `- ${r.url} (${r.status})`),
    '',
    'To skip these in future, add part of the address to `linkCheck.ignore` in `src/config/site.js`.',
    '</details>',
  )
}
const report = lines.join('\n') + '\n'

console.log(
  `[links] ${results.length} checked: ${results.length - broken.length - blocked.length} ok, ${broken.length} broken, ${blocked.length} could not be checked`,
)
for (const r of broken) console.log(`  broken  ${r.status}  ${r.url}  (${pagesOf(r.url).join(', ')})`)
if (option('--report')) writeFileSync(option('--report'), report)
if (option('--json'))
  writeFileSync(option('--json'), JSON.stringify({ broken, blocked, total: results.length }, null, 2))
