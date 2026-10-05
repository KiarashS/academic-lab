// Reads everything in content/ at build time (and in the dev server) and turns it into
// plain data for the app: Markdown bodies become HTML, YAML becomes objects, BibTeX and
// ORCID records become publications. The browser only receives the finished data.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Marked } from 'marked'
import YAML from 'yaml'
import { parseBibtex } from './bibtex.js'
import { addCitationCounts } from './citations.js'
import { enhanceHtmlImages, processImages } from './images.js'
import { fetchOrcidWorks } from './orcid.js'
import { reportProblems, validateContent } from './validate.js'
import { normalizeMedia } from '../src/lib/embed.js'

export const CONTENT_DIR = resolve(import.meta.dirname, '../content')

function readYaml(name) {
  const file = join(CONTENT_DIR, name)
  if (!existsSync(file)) return {}
  return YAML.parse(readFileSync(file, 'utf8')) || {}
}

// YAML and the CMS may write dates as full timestamps; the site only uses the day.
// A publication's or event's `media`: a path or link (image, GIF, video file, YouTube or
// Vimeo), or { src, alt, poster } when it needs more.
function media(value) {
  if (!value) return undefined
  const item = typeof value === 'string' ? { src: value } : value
  return item.src ? normalizeMedia(item) : undefined
}

function day(value) {
  if (!value) return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

export function plainText(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function excerpt(html, max = 200) {
  const firstParagraph = html.match(/<p>([\s\S]*?)<\/p>/)?.[1] || html
  const text = plainText(firstParagraph)
  return text.length <= max ? text : text.slice(0, text.lastIndexOf(' ', max - 1)) + '…'
}

function markdownRenderer(base) {
  // Site-relative links and images (/uploads/x.jpg) get the deploy base path in front,
  // so they still work when the site is served from a subfolder.
  const withBase = (href) => (href && href.startsWith('/') && !href.startsWith('//') ? base + href.slice(1) : href)
  const marked = new Marked({ gfm: true })
  marked.use({
    walkTokens(token) {
      if (token.type === 'link' || token.type === 'image') token.href = withBase(token.href)
    },
    renderer: {
      // Links to other sites open in a new tab, like the rest of the site.
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        const external = /^https?:\/\//.test(href)
        const q = (v) => String(v).replace(/"/g, '&quot;')
        const attrs = [
          `href="${q(href)}"`,
          title && `title="${q(title)}"`,
          external && 'target="_blank" rel="noopener noreferrer"',
        ]
        return `<a ${attrs.filter(Boolean).join(' ')}>${text}</a>`
      },
    },
  })
  return (text) => (text?.trim() ? marked.parse(text) : '')
}

function readMarkdownFolder(folder, render) {
  const dir = join(CONTENT_DIR, folder)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf8')
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
      const front = match ? YAML.parse(match[1]) || {} : {}
      const html = render(match ? match[2] : raw)
      return { id: file.replace(/\.md$/, ''), ...front, html }
    })
}

// Optional `order` in the front matter sets the order; otherwise alphabetical by title/name.
function byOrder(key) {
  return (a, b) =>
    (a.order ?? Infinity) - (b.order ?? Infinity) || String(a[key] || '').localeCompare(String(b[key] || ''))
}

function normalizeTitle(title = '') {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function doiOf(pub) {
  return pub.links?.doi?.match(/10\.\d{4,}\/\S+/)?.[0]?.toLowerCase()
}

// Keep the first copy of each paper, matching on DOI or title. Earlier sources win.
function mergePublications(...sources) {
  const seen = new Set()
  const out = []
  for (const pub of sources.flat()) {
    const keys = [doiOf(pub), normalizeTitle(pub.title)].filter(Boolean)
    if (keys.some((k) => seen.has(k))) continue
    keys.forEach((k) => seen.add(k))
    out.push(pub)
  }
  return out
}

async function loadPublications(site) {
  const config = site.publications.import || {}
  const manual = readYaml('publications.yml').publications || []

  const bibFiles = [config.bibtex].flat().filter(Boolean)
  const fromBib = bibFiles.flatMap((name) => {
    const file = join(CONTENT_DIR, name)
    if (!existsSync(file)) {
      console.warn(`[content] BibTeX file not found: content/${name}`)
      return []
    }
    return parseBibtex(readFileSync(file, 'utf8'))
  })

  const orcidIds = [config.orcid].flat().filter(Boolean)
  const fromOrcid = (await Promise.all(orcidIds.map((id) => fetchOrcidWorks(id)))).flat()

  return mergePublications(manual, fromBib, fromOrcid).map((p) => ({ ...p, year: Number(p.year) || p.year }))
}

export async function loadContent(site, base = '/') {
  const render = markdownRenderer(base)

  const people = readMarkdownFolder('people', render)
    .map(({ html, ...p }) => ({
      ...p,
      bio: html,
      excerpt: excerpt(html),
    }))
    .sort(byOrder('name'))

  const research = readMarkdownFolder('research', render)
    .map(({ html, ...r }) => ({
      ...r,
      description: html,
      excerpt: r.summary || excerpt(html),
    }))
    .sort(byOrder('title'))

  // News and events with a body get their own page.
  const news = readMarkdownFolder('news', render).map((n) => ({
    ...n,
    date: day(n.date),
    hasPage: Boolean(n.html),
  }))
  const events = readMarkdownFolder('events', render).map((e) => ({
    ...e,
    media: media(e.media),
    date: day(e.date),
    endDate: day(e.endDate),
    hasPage: Boolean(e.html),
  }))

  const gallery = (readYaml('gallery.yml').albums || []).map((a) => ({
    ...a,
    date: day(a.date),
    photos: (a.photos || []).map(normalizeMedia),
  }))

  // Talks, awards and press items, newest first.
  const newestFirst = (a, b) => String(b.date || '').localeCompare(String(a.date || ''))
  const talks = (readYaml('talks.yml').talks || [])
    .map((t, i) => ({ ...t, id: `talk-${i + 1}`, date: day(t.date), speakers: t.speakers || [] }))
    .sort(newestFirst)
  const pressFile = readYaml('press.yml')
  const awards = (pressFile.awards || [])
    .map((a, i) => ({ ...a, id: `award-${i + 1}`, date: day(a.date), recipients: a.recipients || [] }))
    .sort(newestFirst)
  const press = (pressFile.press || [])
    .map((p, i) => ({ ...p, id: `press-${i + 1}`, date: day(p.date), people: p.people || [] }))
    .sort(newestFirst)

  // Free text blocks for the home page, placed with 'block:<file name>' in home.sections.
  const homeBlocks = readMarkdownFolder('home', render)

  let publications = (await loadPublications(site)).map((p) => ({ ...p, media: media(p.media) }))
  if (site.publications.citations?.show) publications = await addCitationCounts(publications)

  const content = {
    people,
    research,
    news,
    events,
    publications,
    teaching: readYaml('teaching.yml').courses || [],
    join: readYaml('join.yml'),
    slides: (readYaml('slides.yml').slides || []).map(normalizeMedia),
    gallery,
    resources: readYaml('resources.yml').items || [],
    funders: readYaml('funders.yml').funders || [],
    talks,
    awards,
    press,
    collaborators: readYaml('collaborators.yml').collaborators || [],
    homeBlocks,
    notices: (readYaml('notices.yml').notices || []).map((n, i) => ({
      ...n,
      id: n.id || `notice-${i + 1}`,
      from: day(n.from),
      until: day(n.until),
    })),
  }

  reportProblems(validateContent(content, site))

  // Resize every photo the content uses (see images.js); the app looks them up by path.
  const htmlImages = (html) =>
    [...(html || '').matchAll(/<img [^>]*src="([^"]+)"/g)].map((m) => m[1].slice(base.length - 1))
  content.images = await processImages([
    site.home.intro.image,
    site.footer.credit?.avatar,
    ...[...publications, ...events].map((item) => item.media && (item.media.type === 'image' ? item.media.src : item.media.poster)),
    ...people.flatMap((p) => [p.photo, ...htmlImages(p.bio)]),
    ...research.flatMap((r) => [r.image, ...htmlImages(r.description)]),
    ...news.flatMap((n) => [n.image, ...htmlImages(n.html)]),
    ...events.flatMap((e) => htmlImages(e.html)),
    ...[...content.slides, ...gallery.flatMap((a) => a.photos)].map((m) => (m.type === 'image' ? m.src : m.poster)),
    ...content.funders.map((f) => f.logo),
    ...content.collaborators.map((c) => c.logo),
    ...homeBlocks.flatMap((b) => [b.image, ...htmlImages(b.html)]),
  ])
  for (const p of people) p.bio = enhanceHtmlImages(p.bio, content.images, base)
  for (const r of research) r.description = enhanceHtmlImages(r.description, content.images, base)
  for (const n of news) n.html = enhanceHtmlImages(n.html, content.images, base)
  for (const e of events) e.html = enhanceHtmlImages(e.html, content.images, base)
  for (const b of homeBlocks) b.html = enhanceHtmlImages(b.html, content.images, base)

  return content
}
