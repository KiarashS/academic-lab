import site from '../config/index.js'

// Papers per year as a small bar chart. Every year between the first and the last gets a
// column, so gaps show as gaps. With `onSelect`, each column is a button (click a year to
// filter by it); `selected` highlights one year. A table with the same numbers is there
// for screen readers.
export default function YearChart({ publications, selected = '', onSelect, className = '' }) {
  const config = site.publications.chart
  const counts = new Map()
  for (const pub of publications) {
    const year = Number(pub.year)
    if (Number.isFinite(year)) counts.set(year, (counts.get(year) || 0) + 1)
  }
  if (!counts.size) return null
  const first = Math.min(...counts.keys())
  const last = Math.max(...counts.keys())
  if (last - first + 1 < (config.minYears || 1)) return null

  const years = []
  for (let y = first; y <= last; y++) years.push({ year: y, count: counts.get(y) || 0 })
  const max = Math.max(...years.map((y) => y.count))
  // Label every year when there's room, otherwise every 2nd or 5th, plus the last.
  const step = years.length > 14 ? 5 : years.length > 7 ? 2 : 1
  const labelled = (y) => y === last || (y % step === 0 && last - y >= step / 2)
  const papers = (n) => `${n} ${n === 1 ? 'paper' : 'papers'}`

  return (
    <figure className={className}>
      <figcaption className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">{config.title}</figcaption>
      <div aria-hidden="true">
        <div className="flex h-24 items-end gap-0.5 border-b border-neutral-200 dark:border-neutral-800">
          {years.map(({ year, count }) => {
            const active = !selected || String(year) === String(selected)
            const bar = (
              <>
                <span
                  style={{ height: count ? `${Math.max((count / max) * 100, 4)}%` : 0 }}
                  className={`block w-full max-w-8 rounded-t-[4px] bg-accent transition-opacity ${
                    active ? '' : 'opacity-30'
                  } ${onSelect ? 'group-hover:opacity-100' : ''}`}
                />
                {/* Hover label above the bar. */}
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-neutral-900 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block group-focus-visible:block dark:bg-neutral-100 dark:text-neutral-900">
                  {year}: {papers(count)}
                </span>
              </>
            )
            const column = 'group relative flex h-full flex-1 flex-col items-center justify-end'
            return onSelect && count ? (
              <button
                key={year}
                type="button"
                tabIndex={-1}
                onClick={() => onSelect(String(year) === String(selected) ? '' : String(year))}
                className={`${column} cursor-pointer`}
              >
                {bar}
              </button>
            ) : (
              <div key={year} className={column}>
                {bar}
              </div>
            )
          })}
        </div>
        <div className="mt-1.5 flex gap-0.5 text-[0.7rem] text-neutral-500 tabular-nums dark:text-neutral-400">
          {years.map(({ year }) => (
            <span key={year} className="flex-1 text-center whitespace-nowrap">
              {labelled(year) ? year : ''}
            </span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>{config.title}</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Papers</th>
          </tr>
        </thead>
        <tbody>
          {years.map(({ year, count }) => (
            <tr key={year}>
              <td>{year}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
