import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'
import PublicationItem from '../components/PublicationItem.jsx'
import PublicationList from '../components/PublicationList.jsx'
import SmartLink from '../components/SmartLink.jsx'
import Tag from '../components/Tag.jsx'
import site from '../config/index.js'
import { toBibtex } from '../lib/bibtex.js'
import { memberIdForAuthor, normalizeName, personById, sortedPublications } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

const selectClass =
  'min-w-0 rounded-md border border-neutral-200 bg-transparent px-2.5 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-950'

function downloadBibtex(pubs) {
  const blob = new Blob([pubs.map(toBibtex).join('\n\n') + '\n'], { type: 'application/x-bibtex' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: 'publications.bib' })
  a.click()
  URL.revokeObjectURL(url)
}

function matchesQuery(pub, query) {
  if (!query) return true
  const haystack = [pub.title, pub.venue, pub.abstract, pub.year, ...pub.authors, ...(pub.tags || [])]
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}

// The author filter value is a lab member's id (matches all their name spellings)
// or, for authors outside the lab, the name as written.
function matchesAuthor(pub, author) {
  if (!author) return true
  if (personById[author]) return pub.authors.some((a) => memberIdForAuthor(a) === author)
  const target = normalizeName(author)
  return pub.authors.some((a) => normalizeName(a) === target)
}

function authorOptions(mode) {
  const members = new Map()
  const others = new Map()
  for (const pub of sortedPublications) {
    for (const name of pub.authors) {
      const id = memberIdForAuthor(name)
      if (id) members.set(id, personById[id].name)
      else if (mode === 'all') others.set(normalizeName(name), name)
    }
  }
  const byName = (a, b) => a.label.localeCompare(b.label)
  return {
    members: [...members].map(([value, label]) => ({ value, label })).sort(byName),
    others: [...others.values()].map((name) => ({ value: name, label: name })).sort(byName),
  }
}

export default function Publications() {
  const config = site.publications
  useTitle(config.title)
  const filters = config.filters

  // Filters live in the URL so a filtered view can be shared or bookmarked.
  const [params, setParams] = useSearchParams()
  const get = (key) => (filters.includes(key === 'q' ? 'search' : key) && params.get(key)) || ''
  const query = get('q')
  const type = get('type')
  const year = get('year')
  const tag = get('tag')
  const author = get('author')

  const update = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  const years = useMemo(() => [...new Set(sortedPublications.map((p) => p.year))], [])
  const types = useMemo(
    () => Object.keys(config.types).filter((t) => sortedPublications.some((p) => p.type === t)),
    [config.types],
  )
  const tags = useMemo(() => [...new Set(sortedPublications.flatMap((p) => p.tags || []))].sort(), [])
  const authors = useMemo(() => authorOptions(config.authorFilter), [config.authorFilter])

  const filtered = sortedPublications.filter(
    (p) =>
      (!type || p.type === type) &&
      (!year || String(p.year) === year) &&
      (!tag || p.tags?.includes(tag)) &&
      matchesAuthor(p, author) &&
      matchesQuery(p, query),
  )
  const filtering = Boolean(query || type || year || tag || author)

  const CONTROLS = {
    search: () => (
      <input
        key="search"
        type="search"
        value={query}
        onChange={(e) => update('q', e.target.value)}
        placeholder="Search titles, authors, venues"
        aria-label="Search publications"
        className="min-w-0 flex-1 basis-60 rounded-md border border-neutral-200 bg-transparent px-3 py-1.5 text-sm placeholder:text-neutral-500 dark:border-neutral-800"
      />
    ),
    type: () =>
      types.length > 1 && (
        <select
          key="type"
          value={type}
          onChange={(e) => update('type', e.target.value)}
          aria-label="Type"
          className={selectClass}
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {config.types[t]}
            </option>
          ))}
        </select>
      ),
    year: () =>
      years.length > 1 && (
        <select
          key="year"
          value={year}
          onChange={(e) => update('year', e.target.value)}
          aria-label="Year"
          className={selectClass}
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      ),
    author: () =>
      authors.members.length + authors.others.length > 1 && (
        <select
          key="author"
          value={author}
          onChange={(e) => update('author', e.target.value)}
          aria-label="Author"
          className={`${selectClass} max-w-full`}
        >
          <option value="">All authors</option>
          {authors.others.length > 0 ? (
            <>
              <optgroup label="Lab members">
                {authors.members.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other authors">
                {authors.others.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </optgroup>
            </>
          ) : (
            authors.members.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))
          )}
        </select>
      ),
  }

  const controls = filters.map((key) => CONTROLS[key]?.()).filter(Boolean)
  const showTags = filters.includes('tag') && tags.length > 0

  return (
    <>
      <PageHeader title={config.title} intro={config.intro}>
        {config.scholarUrl && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            Full list on <SmartLink to={config.scholarUrl}>Google Scholar</SmartLink>.
          </p>
        )}
      </PageHeader>

      <div className="mb-10 space-y-4">
        {controls.length > 0 && <div className="flex flex-wrap gap-3">{controls}</div>}
        {showTags && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Tag key={t} active={tag === t} onClick={() => update('tag', tag === t ? '' : t)}>
                {t}
              </Tag>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm pointer-coarse:[&>*]:py-0.5 text-neutral-500 dark:text-neutral-400">
          {config.showCount && (
            <span aria-live="polite">
              {filtering
                ? `${filtered.length} of ${sortedPublications.length} publications`
                : `${sortedPublications.length} publications`}
            </span>
          )}
          {filtering && (
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="cursor-pointer text-accent hover:underline"
            >
              Clear filters
            </button>
          )}
          {config.showDownload && filtered.length > 0 && (
            <button
              type="button"
              onClick={() => downloadBibtex(filtered)}
              className="cursor-pointer text-accent hover:underline"
            >
              Download BibTeX{filtering ? ' for these' : ''}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">No publications match.</p>
      ) : config.groupByYear ? (
        <PublicationList publications={filtered} />
      ) : (
        <div className="space-y-7">
          {filtered.map((pub) => (
            <PublicationItem key={pub.id} pub={pub} />
          ))}
        </div>
      )}
    </>
  )
}
