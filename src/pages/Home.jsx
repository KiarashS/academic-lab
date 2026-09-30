import NewsList from '../components/NewsList.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import PublicationItem from '../components/PublicationItem.jsx'
import Section from '../components/Section.jsx'
import Slider from '../components/Slider.jsx'
import site, { pageEnabled } from '../config/index.js'
import research from '../content/research.js'
import slides from '../content/slides.js'
import { sortedNews, sortedPublications } from '../lib/data.js'
import { asset, paragraphs } from '../lib/utils.js'
import useTitle from '../lib/useTitle.js'

const { home } = site

// "All news →" style link, only when the target page exists.
function more(page, label) {
  return label && pageEnabled(page) ? { to: `/${page}`, label } : null
}

function take(items, count) {
  return count ? items.slice(0, count) : items
}

const SECTIONS = {
  slider: (first) =>
    slides.length > 0 && (
      <div key="slider" className={`mb-14 ${first ? '-mt-4 sm:-mt-8' : ''}`}>
        <Slider
          slides={slides}
          autoplay={home.slider.autoplay}
          interval={home.slider.interval}
          aspectRatio={home.slider.aspectRatio}
        />
      </div>
    ),

  intro: () => {
    const { heading, text, image, imageCaption } = home.intro
    return (
      <section key="intro" className="mb-20">
        {(heading || site.tagline) && (
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
            {heading || site.tagline}
          </h1>
        )}
        {paragraphs(text).map((p, i) => (
          <p key={i} className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            {p}
          </p>
        ))}
        {image && (
          <figure className="mt-10">
            <img src={asset(image)} alt={imageCaption || ''} className="w-full rounded-md" />
            {imageCaption && <figcaption className="mt-2 text-sm text-neutral-500">{imageCaption}</figcaption>}
          </figure>
        )}
      </section>
    )
  },

  news: (first) =>
    sortedNews.length > 0 && (
      <Section key="news" flush={first} title={home.news.title} more={more('news', home.news.moreLink)}>
        <NewsList items={take(sortedNews, home.news.count)} />
      </Section>
    ),

  research: (first) => {
    const active = take(
      research.filter((r) => r.status !== 'past'),
      home.research.count,
    )
    return (
      active.length > 0 && (
        <Section key="research" flush={first} title={home.research.title} more={more('research', home.research.moreLink)}>
          <div className="grid gap-10 sm:grid-cols-2">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )
    )
  },

  publications: (first) => {
    const featured = take(
      sortedPublications.filter((p) => p.featured),
      home.publications.count,
    )
    return (
      featured.length > 0 && (
        <Section
          key="publications"
          flush={first}
          title={home.publications.title}
          more={more('publications', home.publications.moreLink)}
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
  const sections = home.sections.filter((key) => SECTIONS[key])

  return (
    <>
      {/* Keep one h1 on the page for screen readers when the intro is turned off. */}
      {!sections.includes('intro') && <h1 className="sr-only">{site.name}</h1>}
      {sections.map((key, i) => SECTIONS[key](i === 0))}
    </>
  )
}
