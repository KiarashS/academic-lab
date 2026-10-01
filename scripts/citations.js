// Citation counts from Semantic Scholar (https://api.semanticscholar.org), looked up by
// DOI or arXiv ID at build time. No API key is needed for the small number of papers a lab
// has. Results are cached for a day; if the service can't be reached the site is built
// without counts.
import { createHash } from 'node:crypto'
import { cachedJson } from './cache.js'

const API = 'https://api.semanticscholar.org/graph/v1/paper/batch?fields=citationCount,url'

function lookupIds(pub) {
  const ids = []
  const doi = pub.links?.doi?.match(/10\.\d{4,}\/[^\s?#]+/)?.[0]
  const arxiv = pub.links?.arxiv?.match(/(\d{4}\.\d{4,5})(v\d+)?/)?.[1]
  if (doi) ids.push(`DOI:${doi}`)
  if (arxiv) ids.push(`ARXIV:${arxiv}`)
  return ids
}

// The free tier shares a rate limit between all users, so a 429 is retried after a pause.
async function fetchBatch(ids) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    if (res.ok) return res.json()
    // 400 means none of the IDs exist on Semantic Scholar (e.g. placeholder DOIs).
    if (res.status === 400) return ids.map(() => null)
    if (res.status !== 429 || attempt === 3) throw new Error(`${res.status} ${res.statusText}`)
    await new Promise((r) => setTimeout(r, 3000 * 2 ** attempt))
  }
}

// Adds `citations: { count, url }` to papers Semantic Scholar knows about.
export async function addCitationCounts(publications) {
  const wanted = publications.map((p) => ({ pub: p, ids: lookupIds(p) })).filter((x) => x.ids.length)
  if (!wanted.length) return publications

  const allIds = [...new Set(wanted.flatMap((x) => x.ids))].sort()
  const key = `citations-${createHash('sha1').update(allIds.join('|')).digest('hex').slice(0, 16)}`
  const results = await cachedJson(key, 24, async () => {
    try {
      const out = {}
      for (let i = 0; i < allIds.length; i += 400) {
        const batch = allIds.slice(i, i + 400)
        const data = await fetchBatch(batch)
        batch.forEach((id, j) => {
          if (data[j]) out[id] = { count: data[j].citationCount, url: data[j].url }
        })
      }
      console.log(`[citations] ${Object.keys(out).length} of ${allIds.length} IDs found on Semantic Scholar`)
      return out
    } catch (error) {
      console.warn(`[citations] Could not load citation counts: ${error.message}. Continuing without them.`)
      return undefined
    }
  })
  if (!results) return publications

  const byPub = new Map(wanted.map(({ pub, ids }) => [pub, ids.map((id) => results[id]).find(Boolean)]))
  return publications.map((p) => (byPub.get(p) ? { ...p, citations: byPub.get(p) } : p))
}
