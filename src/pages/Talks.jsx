import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import TalkList from '../components/TalkList.jsx'
import site from '../config/index.js'
import { talks } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

export default function Talks() {
  const config = site.talks
  useTitle(config.title)
  const header = <PageHeader title={config.title} intro={config.intro} />

  if (!talks.length) {
    return (
      <>
        {header}
        <p className="text-neutral-500 dark:text-neutral-400">No talks yet.</p>
      </>
    )
  }
  if (!config.groupByYear) {
    return (
      <>
        {header}
        <TalkList talks={talks} />
      </>
    )
  }

  const byYear = {}
  for (const talk of talks) (byYear[String(talk.date || '').slice(0, 4) || 'Other'] ||= []).push(talk)
  return (
    <>
      {header}
      {/* Newest year first; talks without a date go last. */}
      {Object.keys(byYear)
        .sort((a, b) => (a === 'Other') - (b === 'Other') || b.localeCompare(a))
        .map((year) => (
          <Section key={year} title={year}>
            <TalkList talks={byYear[year]} showYear={false} />
          </Section>
        ))}
    </>
  )
}
