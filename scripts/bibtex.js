// A small BibTeX reader: enough for files exported by Zotero, Mendeley, Google Scholar,
// DBLP and hand-written entries. Turns each entry into the site's publication format.

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }

// Common LaTeX accents and symbols. Anything else just has its braces removed.
const ACCENTS = { '"': '̈', "'": '́', '`': '̀', '^': '̂', '~': '̃', '=': '̄', '.': '̇', c: '̧', v: '̌', u: '̆', H: '̋' }
const SYMBOLS = { ss: 'ß', o: 'ø', O: 'Ø', ae: 'æ', AE: 'Æ', aa: 'å', AA: 'Å', l: 'ł', L: 'Ł', i: 'ı' }

export function cleanLatex(value = '') {
  return String(value)
    .replace(/\\([`'^"~=.])\s*\{?\\?([A-Za-z])\}?/g, (_, accent, letter) => (letter + ACCENTS[accent]).normalize('NFC'))
    .replace(/\\([cvuH])\s*\{([A-Za-z])\}/g, (_, accent, letter) => (letter + ACCENTS[accent]).normalize('NFC'))
    .replace(/\\(ss|o|O|ae|AE|aa|AA|l|L|i)\b\s*/g, (_, s) => SYMBOLS[s])
    .replace(/\\&/g, '&')
    .replace(/\\%/g, '%')
    .replace(/\\\$/g, '$')
    .replace(/\\_/g, '_')
    .replace(/\\textendash\s*|--/g, '–')
    .replace(/\\textemdash\s*|---/g, '—')
    .replace(/\\(emph|textit|textbf|textsc|mathrm|text)\s*/g, '')
    .replace(/~/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Split the file into raw entries, respecting nested braces.
function splitEntries(text) {
  const entries = []
  let i = 0
  while ((i = text.indexOf('@', i)) !== -1) {
    const open = text.slice(i).search(/[{(]/)
    if (open === -1) break
    const type = text
      .slice(i + 1, i + open)
      .trim()
      .toLowerCase()
    const start = i + open
    let depth = 0
    let end = start
    for (; end < text.length; end++) {
      if (text[end] === '{' || text[end] === '(') depth++
      else if (text[end] === '}' || text[end] === ')') depth--
      if (depth === 0) break
    }
    if (!['comment', 'preamble', 'string'].includes(type)) {
      entries.push({ type, body: text.slice(start + 1, end), raw: text.slice(i, end + 1) })
    }
    i = end + 1
  }
  return entries
}

function parseFields(body) {
  const comma = body.indexOf(',')
  const key = body.slice(0, comma).trim()
  const fields = {}
  let i = comma + 1
  while (i < body.length) {
    const eq = body.indexOf('=', i)
    if (eq === -1) break
    const name = body.slice(i, eq).replace(/[\s,]/g, '').toLowerCase()
    let j = eq + 1
    while (/\s/.test(body[j])) j++
    let value
    if (body[j] === '{') {
      let depth = 0
      let k = j
      for (; k < body.length; k++) {
        if (body[k] === '{') depth++
        else if (body[k] === '}' && --depth === 0) break
      }
      value = body.slice(j + 1, k)
      i = k + 1
    } else if (body[j] === '"') {
      const k = body.indexOf('"', j + 1)
      value = body.slice(j + 1, k)
      i = k + 1
    } else {
      const k = body.slice(j).search(/[,\n]|$/)
      value = body.slice(j, j + k).trim()
      i = j + k
    }
    if (name) fields[name] = value
    const next = body.indexOf(',', i)
    i = next === -1 ? body.length : next + 1
  }
  return { key, fields }
}

// "Rivera, Alex and M{\"u}ller, K." -> ["Alex Rivera", "K. Müller"]
function parseAuthors(value = '') {
  return value
    .split(/\s+and\s+/i)
    .map((name) => {
      const clean = cleanLatex(name)
      if (!clean.includes(',')) return clean
      const [last, first] = clean.split(',').map((s) => s.trim())
      return first ? `${first} ${last}` : last
    })
    .filter((n) => n && n.toLowerCase() !== 'others')
}

const TYPES = {
  article: 'journal',
  inproceedings: 'conference',
  conference: 'conference',
  proceedings: 'conference',
  phdthesis: 'thesis',
  mastersthesis: 'thesis',
  thesis: 'thesis',
  book: 'book',
  inbook: 'book',
  incollection: 'book',
}

const LINK_FIELDS = ['pdf', 'code', 'data', 'slides', 'video', 'poster', 'project']

const SITE_FIELDS = ['featured', 'award', 'projects', 'summary', ...LINK_FIELDS.filter((f) => f !== 'pdf')]

// Drops fields from a raw entry, including values in braces or quotes that span lines.
function removeFields(raw, names) {
  const start = new RegExp(`(^|[,\\s])(${names.join('|')})\\s*=\\s*`, 'gi')
  let out = raw
  let match
  while ((match = start.exec(out))) {
    const from = match.index + match[1].length
    let i = match.index + match[0].length
    if (out[i] === '{') {
      for (let depth = 0; i < out.length; i++) {
        if (out[i] === '{') depth++
        else if (out[i] === '}' && --depth === 0) break
      }
      i++
    } else if (out[i] === '"') {
      i = out.indexOf('"', i + 1) + 1
    } else {
      while (i < out.length && !/[,}\n]/.test(out[i])) i++
    }
    // Take the comma after the value and the rest of that line with it.
    const rest = out.slice(i).match(/^\s*,?[ \t]*\n?/)[0]
    // Also drop the indentation before the field.
    const lineStart = out.lastIndexOf('\n', from - 1) + 1
    const cut = /^\s*$/.test(out.slice(lineStart, from)) ? lineStart : from
    out = out.slice(0, cut) + out.slice(i + rest.length)
    start.lastIndex = cut
  }
  return out
}

function toPublication({ type, raw }, { key, fields: f }) {
  const doi = f.doi && cleanLatex(f.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
  const arxivId = (f.archiveprefix || f.eprinttype || '').toLowerCase() === 'arxiv' ? f.eprint : null
  const isArxivUrl = /arxiv\.org/.test(f.url || '')
  const links = {}
  for (const name of LINK_FIELDS) if (f[name]) links[name] = cleanLatex(f[name])
  if (doi) links.doi = `https://doi.org/${doi}`
  if (arxivId) links.arxiv = `https://arxiv.org/abs/${cleanLatex(arxivId)}`
  else if (isArxivUrl) links.arxiv = f.url
  if (f.url && !isArxivUrl && !links.pdf) links[/\.pdf($|\?)/i.test(f.url) ? 'pdf' : 'project'] = f.url

  const venue =
    f.journal ||
    f.booktitle ||
    f.school ||
    f.institution ||
    f.howpublished ||
    f.publisher ||
    (arxivId || isArxivUrl ? 'arXiv preprint' : '')
  const thesisKind = { phdthesis: 'PhD thesis', mastersthesis: "Master's thesis" }[type]
  const fullVenue = thesisKind ? [thesisKind, cleanLatex(venue)].filter(Boolean).join(', ') : cleanLatex(venue)
  const month = f.month ? MONTHS[f.month.toLowerCase().slice(0, 3)] || Number(f.month) || undefined : undefined
  const pubType = TYPES[type] || (arxivId || isArxivUrl ? 'preprint' : 'other')
  const list = (v) =>
    v
      ? cleanLatex(v)
          .split(/\s*[,;]\s*/)
          .filter(Boolean)
      : undefined

  return {
    id: key,
    title: cleanLatex(f.title),
    authors: parseAuthors(f.author || f.editor),
    venue: fullVenue,
    year: Number(f.year) || f.year,
    month,
    volume: f.volume && cleanLatex(f.volume),
    pages: f.pages && cleanLatex(f.pages).replace(/–/g, '-'),
    publisher: f.journal && f.publisher ? cleanLatex(f.publisher) : undefined,
    type:
      f.type && ['journal', 'conference', 'workshop', 'preprint', 'book', 'thesis', 'other'].includes(f.type)
        ? f.type
        : pubType,
    abstract: f.abstract && cleanLatex(f.abstract),
    summary: f.summary && cleanLatex(f.summary),
    tags: list(f.keywords),
    projects: list(f.projects),
    featured: /^(true|yes|1)$/i.test(f.featured || '') || undefined,
    award: f.award && cleanLatex(f.award),
    links,
    // Keep the entry as written, minus the site-only fields, for BibTeX export.
    bibtex: removeFields(raw, SITE_FIELDS).replace(/,(\s*\n?\s*})$/, '$1'),
  }
}

export function parseBibtex(text) {
  return splitEntries(text)
    .map((entry) => {
      try {
        const parsed = parseFields(entry.body)
        return parsed.fields.title ? toPublication(entry, parsed) : null
      } catch (error) {
        console.warn(`[bibtex] Skipping an entry that could not be read: ${entry.raw.slice(0, 60)}…`, error.message)
        return null
      }
    })
    .filter(Boolean)
    .map((pub) => Object.fromEntries(Object.entries(pub).filter(([, v]) => v !== undefined && v !== '')))
}
