// Stars, latest release and license for software on the Software & Data page, from the
// GitHub API at build time. The repository comes from the item's `repo` (owner/name) or
// its first GitHub link. Without a token GitHub allows 60 requests an hour, plenty for a
// lab; the deploy workflow passes its GITHUB_TOKEN anyway. Results are cached for 12 hours,
// and if GitHub can't be reached the page is built without them.
import { cachedJson } from './cache.js'

export function repoOf(item) {
  if (item.repo)
    return String(item.repo)
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\/$/, '')
  for (const link of item.links || []) {
    const match = String(link.url || '').match(
      /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?]|$)/,
    )
    if (match) return `${match[1]}/${match[2]}`
  }
  return null
}

async function get(path) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'academic-lab site builder' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

async function loadRepo(repo) {
  try {
    const info = await get(`/repos/${repo}`)
    if (!info) {
      console.warn(`[github] ${repo} not found (or private). Skipping it.`)
      return null
    }
    const release = await get(`/repos/${repo}/releases/latest`)
    return {
      stars: info.stargazers_count,
      license: info.license?.spdx_id && info.license.spdx_id !== 'NOASSERTION' ? info.license.spdx_id : null,
      archived: Boolean(info.archived),
      updated: info.pushed_at?.slice(0, 10) || null,
      release: release
        ? { tag: release.tag_name, date: release.published_at?.slice(0, 10), url: release.html_url }
        : null,
      url: info.html_url,
    }
  } catch (error) {
    console.warn(`[github] Could not load ${repo}: ${error.message}. Continuing without it.`)
    return undefined // not cached, so the next build tries again
  }
}

// Adds `github: { stars, license, archived, updated, release, url }` to items with a repo.
export async function addGithubInfo(items) {
  return Promise.all(
    items.map(async (item) => {
      const repo = repoOf(item)
      if (!repo) return item
      const github = await cachedJson(`github-${repo}`, 12, () => loadRepo(repo))
      return github ? { ...item, github } : item
    }),
  )
}
