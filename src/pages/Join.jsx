import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/site.js'
import join from '../content/join.js'
import useTitle from '../lib/useTitle.js'

export default function Join() {
  useTitle('Join')
  return (
    <>
      <PageHeader title="Join the lab" intro={join.intro} />
      <Section title="Positions">
        <ul className="space-y-8">
          {join.openings.map((o) => (
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
      {join.howToApply && (
        <Section title="How to apply">
          <p className="max-w-2xl leading-relaxed">
            {join.howToApply}
            {site.contact.email && (
              <>
                {' '}
                <SmartLink to={`mailto:${site.contact.email}`}>{site.contact.email}</SmartLink>
              </>
            )}
          </p>
        </Section>
      )}
    </>
  )
}
