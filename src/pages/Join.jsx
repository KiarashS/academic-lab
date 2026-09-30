import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/index.js'
import { join } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

export default function Join() {
  const config = site.join
  useTitle(config.title)
  const openings = join.openings.filter((o) => o.open || config.showClosedPositions)
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
                      o.open
                        ? 'bg-accent/10 text-accent'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {o.open ? 'Open' : 'Closed'}
                  </span>
                </h3>
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
