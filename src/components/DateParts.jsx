import site from '../config/index.js'

// A date as fixed-width columns: "08 Sep 2026". Days are padded to two digits and each
// part has a minimum width, so in a list of dates the days, months and years line up
// under each other.
export default function DateParts({ iso, showYear = true, className = '', dateTime = iso }) {
  const [y, m, d] = iso.split('-').map(Number)
  const month = new Date(Date.UTC(y, (m || 1) - 1, 1)).toLocaleDateString(site.locale || 'en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
  return (
    <time dateTime={dateTime} className={`whitespace-nowrap tabular-nums ${className}`}>
      <span className="inline-block min-w-[1.55em]">{String(d).padStart(2, '0')}</span>
      <span className="inline-block min-w-[2.35em]">{month}</span>
      {showYear && <span>{y}</span>}
    </time>
  )
}
