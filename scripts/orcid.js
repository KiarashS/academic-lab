// Pulls a researcher's works from their public ORCID record (no API key needed) and turns
// them into the site's publication format. Results are cached on disk for 12 hours (see
// cache.js) so dev-server reloads and the two build steps don't refetch. If ORCID can't be
// reached the build carries on without those papers and prints a warning.
import { cachedJson } from './cache.js'

const API = 'https://pub.orcid.org/v3.0'

const TYPES = {
  'journal-article': 'journal',
  'conference-paper': 'conference',
  'conference-abstract': 'conference',
  'conference-poster': 'conference',
  preprint: 'preprint',
  'working-paper': 'preprint',
  book: 'book',
  'book-chapter': 'book',
  'dissertation-thesis': 'thesis',
  dissertation: 'thesis',
}

async function get(path) {
  const res = await fetch(API + path, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`)
  return res.json()
}

function toPublication(work, ownerName) {
  const ids = work['external-ids']?.['external-id'] || []
  const idOf = (type) => ids.find((x) => x['external-id-type'] === type)?.['external-id-value']
  const doi = idOf('doi')
  const arxiv = idOf('arxiv')
  const date = work['publication-date'] || {}
  const authors = (work.contributors?.contributor || [])
    .filter(
      (c) =>
        !c['contributor-attributes']?.['contributor-role'] ||
        c['contributor-attributes']['contributor-role'] === 'author',
    )
    .map((c) => c['credit-name']?.value)
    .filter(Boolean)
  const links = {}
  if (doi) links.doi = `https://doi.org/${doi}`
  if (arxiv) links.arxiv = `https://arxiv.org/abs/${arxiv.replace(/^arxiv:/i, '')}`
  if (!doi && !arxiv && work.url?.value) links.project = work.url.value

  return {
    id: doi ? doi.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `orcid-${work['put-code']}`,
    title: work.title?.title?.value,
    authors: authors.length ? authors : [ownerName].filter(Boolean),
    venue: work['journal-title']?.value || '',
    year: Number(date.year?.value) || undefined,
    month: Number(date.month?.value) || undefined,
    type: TYPES[work.type] || 'other',
    abstract: work['short-description'] || undefined,
    links,
    source: 'orcid',
  }
}

export async function fetchOrcidWorks(orcidId) {
  const id = orcidId.replace(/^https?:\/\/orcid\.org\//, '').trim()
  return (await cachedJson(`orcid-${id}`, 12, () => loadWorks(id))) || []
}

async function loadWorks(id) {
  try {
    const [person, summary] = await Promise.all([get(`/${id}/person`), get(`/${id}/works`)])
    const given = person.name?.['given-names']?.value
    const family = person.name?.['family-name']?.value
    const ownerName = [given, family].filter(Boolean).join(' ')

    // The summary lists each work once per source; take the preferred version's put-code
    // and fetch full records (with authors) 100 at a time.
    const codes = (summary.group || []).map((g) => g['work-summary']?.[0]?.['put-code']).filter(Boolean)
    const works = []
    for (let i = 0; i < codes.length; i += 100) {
      const bulk = await get(`/${id}/works/${codes.slice(i, i + 100).join(',')}`)
      works.push(...(bulk.bulk || []).map((b) => b.work).filter(Boolean))
    }
    const pubs = works
      .map((w) => toPublication(w, ownerName))
      .filter((p) => p.title && p.year)
      .map((p) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined)))
    console.log(`[orcid] ${id}: ${pubs.length} works`)
    return pubs
  } catch (error) {
    console.warn(`[orcid] Could not load works for ${id}: ${error.message}. Continuing without them.`)
    return undefined // not cached, so the next build tries again
  }
}
