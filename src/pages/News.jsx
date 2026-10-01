import NewsList from '../components/NewsList.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import site from '../config/index.js'
import { sortedNews } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

export default function News() {
  const config = site.news
  useTitle(config.title)

  // RSS needs absolute links, so it's only built when site.url is set.
  const header = (
    <PageHeader title={config.title} intro={config.intro}>
      {config.rss && site.url && (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Follow along with the{' '}
          <a href={`${import.meta.env.BASE_URL}news.xml`} className="prose-link">
            RSS feed
          </a>
          .
        </p>
      )}
    </PageHeader>
  )

  if (!config.groupByYear) {
    return (
      <>
        {header}
        <NewsList items={sortedNews} />
      </>
    )
  }

  const byYear = {}
  for (const item of sortedNews) (byYear[item.date.slice(0, 4)] ||= []).push(item)
  const years = Object.keys(byYear).sort().reverse()

  return (
    <>
      {header}
      {years.map((y) => (
        <Section key={y} title={y}>
          <NewsList items={byYear[y]} showYear={false} />
        </Section>
      ))}
    </>
  )
}
