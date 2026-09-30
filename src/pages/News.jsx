import NewsList from '../components/NewsList.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import { sortedNews } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

export default function News() {
  useTitle('News')
  const byYear = {}
  for (const item of sortedNews) (byYear[item.date.slice(0, 4)] ||= []).push(item)
  const years = Object.keys(byYear).sort().reverse()

  return (
    <>
      <PageHeader title="News" />
      {years.map((y) => (
        <Section key={y} title={y}>
          <NewsList items={byYear[y]} />
        </Section>
      ))}
    </>
  )
}
