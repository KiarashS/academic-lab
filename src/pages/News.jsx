import NewsList from '../components/NewsList.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import site from '../config/index.js'
import { sortedNews } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

export default function News() {
  const config = site.news
  useTitle(config.title)

  if (!config.groupByYear) {
    return (
      <>
        <PageHeader title={config.title} intro={config.intro} />
        <NewsList items={sortedNews} />
      </>
    )
  }

  const byYear = {}
  for (const item of sortedNews) (byYear[item.date.slice(0, 4)] ||= []).push(item)
  const years = Object.keys(byYear).sort().reverse()

  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      {years.map((y) => (
        <Section key={y} title={y}>
          <NewsList items={byYear[y]} />
        </Section>
      ))}
    </>
  )
}
