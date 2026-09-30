import site from '../config/site.js'
import research from '../content/research.js'
import slides from '../content/slides.js'
import NewsList from '../components/NewsList.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import PublicationItem from '../components/PublicationItem.jsx'
import Section from '../components/Section.jsx'
import Slider from '../components/Slider.jsx'
import { sortedNews, sortedPublications } from '../lib/data.js'
import { asset } from '../lib/utils.js'
import useTitle from '../lib/useTitle.js'

const enabled = (page) => site.nav.some((item) => item.page === page)

const SECTIONS = {
  news: () =>
    sortedNews.length > 0 && (
      <Section key="news" title="News" more={enabled('news') && { to: '/news', label: 'All news' }}>
        <NewsList items={sortedNews.slice(0, site.home.newsCount)} />
      </Section>
    ),
  research: () => {
    const active = research.filter((r) => r.status !== 'past')
    return (
      active.length > 0 && (
        <Section key="research" title="Research" more={enabled('research') && { to: '/research', label: 'All projects' }}>
          <div className="grid gap-10 sm:grid-cols-2">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )
    )
  },
  publications: () => {
    const featured = sortedPublications.filter((p) => p.featured)
    return (
      featured.length > 0 && (
        <Section
          key="publications"
          title="Selected publications"
          more={enabled('publications') && { to: '/publications', label: 'All publications' }}
        >
          <div className="space-y-7">
            {featured.map((pub) => (
              <PublicationItem key={pub.id} pub={pub} />
            ))}
          </div>
        </Section>
      )
    )
  },
}

export default function Home() {
  useTitle()
  const { home } = site
  const slider = home.slider

  return (
    <>
      {slider?.show && slides.length > 0 && (
        <div className="-mt-4 mb-14 sm:-mt-8">
          <Slider
            slides={slides}
            autoplay={slider.autoplay}
            interval={slider.interval}
            aspectRatio={slider.aspectRatio}
          />
        </div>
      )}
      <section className="mb-20">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
          {site.tagline}
        </h1>
        {home.intro.map((p, i) => (
          <p key={i} className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            {p}
          </p>
        ))}
        {home.image && (
          <figure className="mt-10">
            <img src={asset(home.image)} alt={home.imageCaption || ''} className="w-full rounded-md" />
            {home.imageCaption && (
              <figcaption className="mt-2 text-sm text-neutral-500">{home.imageCaption}</figcaption>
            )}
          </figure>
        )}
      </section>

      {home.sections.map((key) => SECTIONS[key]?.())}
    </>
  )
}
