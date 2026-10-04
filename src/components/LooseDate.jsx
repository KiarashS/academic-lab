import DateParts from './DateParts.jsx'

// A date that may be a full day (2026-05-01), a month (2026-05) or only a year (2026).
// All use the usual date columns, with the unknown parts left blank so years line up.
export default function LooseDate({ value, className = '' }) {
  const text = String(value || '')
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return <DateParts iso={text} className={className} />
  if (/^\d{4}-\d{2}$/.test(text)) {
    return <DateParts iso={`${text}-01`} dateTime={text} className={`${className} [&>span:first-child]:invisible`} />
  }
  if (/^\d{4}$/.test(text)) {
    // Day and month take up their usual space, so the year lines up with the others.
    return (
      <DateParts iso={`${text}-01-01`} dateTime={text} className={`${className} [&>span:nth-child(-n+2)]:invisible`} />
    )
  }
  return <span className={className}>{text}</span>
}
