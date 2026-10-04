import AwardList from '../components/AwardList.jsx'
import Authors from '../components/Authors.jsx'
import LooseDate from '../components/LooseDate.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/index.js'
import { awards, peopleNames, press } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

function PressList({ items }) {
  return (
    <ul className="space-y-6">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4">
          <LooseDate value={item.date} className="text-[0.8rem] leading-6 text-neutral-500 dark:text-neutral-400" />
          <div>
            <h3 className="leading-6 font-medium text-neutral-900 dark:text-neutral-100">
              {item.url ? <SmartLink to={item.url}>{item.title}</SmartLink> : item.title}
            </h3>
            {item.outlet && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{item.outlet}</p>}
            {item.people.length > 0 && (
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                <Authors authors={peopleNames(item.people)} />
              </p>
            )}
            {item.summary && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {item.summary}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Press() {
  const config = site.press
  useTitle(config.title)
  const SECTIONS = {
    awards: () =>
      awards.length > 0 && (
        <Section key="awards" title={config.awardsTitle}>
          <AwardList awards={awards} />
        </Section>
      ),
    press: () =>
      press.length > 0 && (
        <Section key="press" title={config.pressTitle}>
          <PressList items={press} />
        </Section>
      ),
  }
  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      {config.sections.map((key) => SECTIONS[key]?.())}
    </>
  )
}
