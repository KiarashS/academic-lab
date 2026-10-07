import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/index.js'
import { join, positionOpen } from '../lib/data.js'
import { useToday } from '../lib/hydration.js'
import useTitle from '../lib/useTitle.js'

const DAY = 24 * 60 * 60 * 1000

// "Apply by 15 Dec 2026 · 5 days left", or "Closed 15 Dec 2026" once it has passed.
function Deadline({ date, today, open }) {
  const [y, m, d] = date.split('-').map(Number)
  const formatted = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(site.locale || 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const days = Math.round((Date.parse(date) - Date.parse(today)) / DAY)
  const left = days === 0 ? 'last day' : days <= 14 ? `${days} day${days === 1 ? '' : 's'} left` : null
  return (
    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
      {open ? 'Apply by ' : 'Closed '}
      <time dateTime={date}>{formatted}</time>
      {open && left && <span className="text-accent"> · {left}</span>}
    </p>
  )
}

export default function Join() {
  const config = site.join
  useTitle(config.title)
  const today = useToday()
  const openings = join.openings
    .map((o) => ({ ...o, isOpen: positionOpen(o, today) }))
    .filter((o) => o.isOpen || config.showClosedPositions)
  const email = site.contact.email

  const SECTIONS = {
    positions: () =>
      openings.length > 0 && (
        <Section key="positions" title={config.positionsTitle}>
          <ul className="space-y-8">
            {openings.map((o) => (
              <li key={o.title}>
                <h3 className="flex items-center gap-2.5 font-medium text-neutral-900 dark:text-neutral-100">
                  {o.title}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-normal ${
                      o.isOpen
                        ? 'bg-accent/10 text-accent'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {o.isOpen ? 'Open' : 'Closed'}
                  </span>
                </h3>
                {o.deadline && <Deadline date={o.deadline} today={today} open={o.isOpen} />}
                <p className="mt-1.5 max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {o.text}
                  {o.url && (
                    <>
                      {' '}
                      <SmartLink to={o.url}>Details</SmartLink>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ),
    apply: () =>
      join.howToApply && (
        <Section key="apply" title={config.applyTitle}>
          <p className="max-w-2xl leading-relaxed">
            {join.howToApply}
            {email && (
              <>
                {' '}
                <SmartLink to={`mailto:${email}`}>{email}</SmartLink>
              </>
            )}
          </p>
        </Section>
      ),
  }

  return (
    <>
      <PageHeader title={config.title} intro={config.sections.includes('intro') ? join.intro : null} />
      {config.sections.map((key) => SECTIONS[key]?.())}
    </>
  )
}
