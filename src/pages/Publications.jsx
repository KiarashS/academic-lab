import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import PageHeader from '../components/PageHeader.jsx'
import PublicationList from '../components/PublicationList.jsx'
import SmartLink from '../components/SmartLink.jsx'
import Tag from '../components/Tag.jsx'
import site from '../config/site.js'
import { sortedPublications } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

const selectClass =
  'rounded-md border border-neutral-200 bg-transparent px-2.5 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-950'

function matches(pub, query) {
  if (!query) return true
  const haystack = [pub.title, pub.venue, pub.abstract, pub.year, ...pub.authors, ...(pub.tags || [])]
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word))
}

export default function Publications() {
  useTitle('Publications')
  // Filters live in the URL so a filtered view can be shared or bookmarked.
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const type = params.get('type') || ''
  const year = params.get('year') || ''
  const tag = params.get('tag') || ''

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
  const types = useMemo(() => Object.keys(site.publications.types).filter((t) => sortedPublications.some((p) => p.type === t)), [])
  const tags = useMemo(() => [...new Set(sortedPublications.flatMap((p) => p.tags || []))].sort(), [])

  const filtered = sortedPublications.filter(
    (p) =>
      (!type || p.type === type) &&
      (!year || String(p.year) === year) &&
      (!tag || p.tags?.includes(tag)) &&
      matches(p, query),
  )
  const filtering = query || type || year || tag

  return (
    <>
      <PageHeader title="Publications">
        {site.publications.scholarUrl && (
          <p className="mt-4 text-sm text-neutral-500">
            Full list on <SmartLink to={site.publications.scholarUrl}>Google Scholar</SmartLink>.
          </p>
        )}
      </PageHeader>

      <div className="mb-10 space-y-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Search titles, authors, venues"
            aria-label="Search publications"
            className="min-w-0 flex-1 basis-60 rounded-md border border-neutral-200 bg-transparent px-3 py-1.5 text-sm placeholder:text-neutral-400 dark:border-neutral-800"
          />
          {types.length > 1 && (
            <select value={type} onChange={(e) => update('type', e.target.value)} aria-label="Type" className={selectClass}>
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {site.publications.types[t]}
                </option>
              ))}
            </select>
          )}
          {years.length > 1 && (
            <select value={year} onChange={(e) => update('year', e.target.value)} aria-label="Year" className={selectClass}>
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Tag key={t} active={tag === t} onClick={() => update('tag', tag === t ? '' : t)}>
                {t}
              </Tag>
            ))}
          </div>
        )}
        {filtering && (
          <p className="text-sm text-neutral-500">
            {filtered.length} of {sortedPublications.length} publications.{' '}
            <button type="button" onClick={() => setParams({}, { replace: true })} className="cursor-pointer text-accent hover:underline">
              Clear filters
            </button>
          </p>
        )}
      </div>

      {filtered.length > 0 ? (
        <PublicationList publications={filtered} />
      ) : (
        <p className="text-neutral-500">No publications match.</p>
      )}
    </>
  )
}
