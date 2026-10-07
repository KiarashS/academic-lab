// Publications from Semantic Scholar and DBLP author profiles, turned into the site's
// publication format. Like ORCID (orcid.js), results are cached for 12 hours, and if a
// service can't be reached the build carries on without those papers and prints a warning.
import { cachedJson } from './cache.js'

const clean = (pub) => Object.fromEntries(Object.entries(pub).filter(([, v]) => v !== undefined && v !== ''))
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function idFor(doi, fallback) {
  return doi ? slug(doi) : fallback
}

// ---- Semantic Scholar -----------------------------------------------------------------

const S2_FIELDS = [
  'title',
  'authors',
  'year',
  'venue',
  'publicationVenue',
  'externalIds',
  'publicationTypes',
  'abstract',
  'journal',
  'openAccessPdf',
  'publicationDate',
].join(',')

async function s2Get(url) {
  // The free tier shares a rate limit between all users, so a 429 is retried after a pause.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (res.ok) return res.json()
    if (res.status !== 429 || attempt === 3) throw new Error(`${res.status} ${res.statusText}`)
    await new Promise((r) => setTimeout(r, 3000 * 2 ** attempt))
  }
}

function s2Type(types = [], venue = '') {
  if (/arxiv|biorxiv|medrxiv|ssrn/i.test(venue)) return 'preprint'
  if (types.includes('Conference')) return 'conference'
  if (types.includes('JournalArticle') || types.includes('Review')) return 'journal'
  if (types.includes('Book') || types.includes('BookSection')) return 'book'
  return 'other'
}

export function fromSemanticScholar(paper) {
  const ids = paper.externalIds || {}
  const doi = ids.DOI
  const links = {}
  if (doi) links.doi = `https://doi.org/${doi}`
  if (ids.ArXiv) links.arxiv = `https://arxiv.org/abs/${ids.ArXiv}`
  if (paper.openAccessPdf?.url) links.pdf = paper.openAccessPdf.url
  const venue = paper.journal?.name || paper.publicationVenue?.name || paper.venue || ''
  const month = Number(paper.publicationDate?.slice(5, 7)) || undefined
  return clean({
    id: idFor(doi, `s2-${paper.paperId}`),
    title: paper.title?.replace(/\.$/, ''),
    authors: (paper.authors || []).map((a) => a.name).filter(Boolean),
    venue: ids.ArXiv && !paper.journal?.name && !paper.venue ? 'arXiv preprint' : venue,
    year: paper.year || undefined,
    month,
    volume: paper.journal?.volume?.trim() || undefined,
    pages: paper.journal?.pages?.replace(/\s/g, '') || undefined,
    type: s2Type(paper.publicationTypes || [], venue || (ids.ArXiv ? 'arxiv' : '')),
    abstract: paper.abstract || undefined,
    links,
    source: 'semanticscholar',
  })
}

async function loadSemanticScholar(authorId) {
  try {
    const papers = []
    for (let offset = 0; ; offset += 500) {
      const page = await s2Get(
        `https://api.semanticscholar.org/graph/v1/author/${encodeURIComponent(authorId)}/papers?fields=${S2_FIELDS}&limit=500&offset=${offset}`,
      )
      papers.push(...(page.data || []))
      if (page.next == null || !page.data?.length) break
    }
    const pubs = papers
      .map(fromSemanticScholar)
      .filter((p) => p.title && p.year && p.authors?.length)
      // Records with no venue and no DOI or arXiv ID are mostly front matter and talks.
      .filter((p) => p.venue || p.links.doi || p.links.arxiv)
    console.log(`[semanticscholar] author ${authorId}: ${pubs.length} papers`)
    return pubs
  } catch (error) {
    console.warn(
      `[semanticscholar] Could not load papers for author ${authorId}: ${error.message}. Continuing without them.`,
    )
    return undefined // not cached, so the next build tries again
  }
}

export async function fetchSemanticScholar(value) {
  // Accepts the numeric ID or the profile URL (https://www.semanticscholar.org/author/Name/1741101).
  const id = String(value).match(/(\d+)\/?$/)?.[1]
  if (!id) {
    console.warn(`[semanticscholar] "${value}" is not an author ID or profile link. Skipping it.`)
    return []
  }
  return (await cachedJson(`s2-author-${id}`, 12, () => loadSemanticScholar(id))) || []
}

// ---- DBLP ------------------------------------------------------------------------------

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
function decode(text = '') {
  return text
    .replace(/<[^>]+>/g, '') // inline markup such as <i> or <sub> in titles
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m)
    .trim()
}

const tagValues = (xml, tag) =>
  [...xml.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => decode(m[1]))
const tagValue = (xml, tag) => tagValues(xml, tag)[0]

const DBLP_TYPES = {
  article: 'journal',
  inproceedings: 'conference',
  proceedings: 'book',
  book: 'book',
  incollection: 'book',
  phdthesis: 'thesis',
  mastersthesis: 'thesis',
}

// One <r> record from a DBLP person file (https://dblp.org/pid/<pid>.xml).
export function fromDblp(recordXml) {
  const match = recordXml.match(
    /<(article|inproceedings|proceedings|book|incollection|phdthesis|mastersthesis)\s([^>]*)>/,
  )
  if (!match) return null
  const [, kind, attrs] = match
  const key = attrs.match(/key=["']([^"']+)/)?.[1] || ''
  const informal = /publtype=["']informal/.test(attrs)
  // DBLP adds a number to tell people with the same name apart ("Jane Doe 0002").
  const authors = tagValues(recordXml, 'author').map((a) => a.replace(/\s+\d{4}$/, ''))
  const ees = tagValues(recordXml, 'ee')
  const doi = ees.map((u) => u.match(/doi\.org\/(10\.\d{4,}\/\S+)/)?.[1]).find(Boolean)
  const arxiv = ees.find((u) => /arxiv\.org\/abs\//.test(u))
  const journal = tagValue(recordXml, 'journal')
  const links = {}
  if (doi) links.doi = `https://doi.org/${doi}`
  if (arxiv) links.arxiv = arxiv
  if (!doi && !arxiv && ees[0]) links.project = ees[0]
  const isPreprint = informal || journal === 'CoRR'
  return clean({
    id: idFor(doi, `dblp-${slug(key)}`),
    title: tagValue(recordXml, 'title')?.replace(/\.$/, ''),
    authors,
    venue:
      journal === 'CoRR'
        ? 'arXiv preprint'
        : journal || tagValue(recordXml, 'booktitle') || tagValue(recordXml, 'school') || '',
    year: Number(tagValue(recordXml, 'year')) || undefined,
    volume: journal && journal !== 'CoRR' ? tagValue(recordXml, 'volume') : undefined,
    pages: tagValue(recordXml, 'pages'),
    type: isPreprint ? 'preprint' : DBLP_TYPES[kind] || 'other',
    links,
    source: 'dblp',
  })
}

export function parseDblpPerson(xml) {
  return [...xml.matchAll(/<r>([\s\S]*?)<\/r>/g)].map((m) => fromDblp(m[1])).filter((p) => p?.title && p.year)
}

async function loadDblp(pid) {
  try {
    const res = await fetch(`https://dblp.org/pid/${pid}.xml`, {
      headers: { Accept: 'application/xml', 'User-Agent': 'academic-lab site builder' },
    })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const xml = await res.text()
    if (!xml.includes('<dblpperson')) {
      throw new Error(
        'DBLP answered with a web page instead of data (it sometimes blocks automated requests). ' +
          'Use "export bibliography > BibTeX" on your DBLP page and add the file to publications.import.bibtex instead',
      )
    }
    const pubs = parseDblpPerson(xml)
    console.log(`[dblp] ${pid}: ${pubs.length} papers`)
    return pubs
  } catch (error) {
    console.warn(`[dblp] Could not load papers for ${pid}: ${error.message}. Continuing without them.`)
    return undefined
  }
}

export async function fetchDblp(value) {
  // Accepts the pid ("h/GeoffreyEHinton", "123/4567") or the profile URL.
  const pid = String(value)
    .replace(/^https?:\/\/(dblp\.org|dblp\.uni-trier\.de)\/pid\//, '')
    .replace(/\.(html|xml)$/, '')
    .trim()
  return (await cachedJson(`dblp-${pid}`, 12, () => loadDblp(pid))) || []
}
