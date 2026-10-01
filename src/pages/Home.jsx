import EventList from '../components/EventList.jsx'
import Img from '../components/Img.jsx'
import Markdown from '../components/Markdown.jsx'
import NewsList from '../components/NewsList.jsx'
import Notice, { useNotices } from '../components/Notice.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import PublicationItem from '../components/PublicationItem.jsx'
import Section from '../components/Section.jsx'
import Slider from '../components/Slider.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site, { pageEnabled } from '../config/index.js'
import {
  funders,
  homeBlocks,
  join,
  research,
  slides,
  sortedNews,
  sortedPublications,
  splitEvents,
} from '../lib/data.js'
import { useToday } from '../lib/hydration.js'
import { paragraphs } from '../lib/utils.js'
import useTitle from '../lib/useTitle.js'

const { home } = site

// "All news →" style link, only when the target page exists.
function more(page, label) {
  return label && pageEnabled(page) ? { to: `/${page}`, label } : null
}

function take(items, count) {
  return count ? items.slice(0, count) : items
}

const blockById = Object.fromEntries(homeBlocks.map((b) => [b.id, b]))

// A free text block from content/home/<id>.md: optional title, Markdown text, optional
// image beside it, optional link, and a plain or highlighted style.
function TextBlock({ block, first }) {
  const side = block.image && (
    <Img
      src={block.image}
      sizes="(min-width: 768px) 30rem, 100vw"
      alt={block.imageAlt || ''}
      loading="lazy"
      className="w-full rounded-md"
    />
  )
  const body = (
    <div>
      <Markdown html={block.html} />
      {block.link?.url && (
        <p className="mt-4">
          <SmartLink to={block.link.url}>{block.link.label || 'Read more'} &rarr;</SmartLink>
        </p>
      )}
    </div>
  )
  const content = side ? (
    <div className="grid items-start gap-8 md:grid-cols-2">
      {block.imagePosition === 'left'
        ? [<div key="i">{side}</div>, <div key="b">{body}</div>]
        : [<div key="b">{body}</div>, <div key="i">{side}</div>]}
    </div>
  ) : (
    body
  )
  const inner =
    block.style === 'highlight' ? (
      <div className="rounded-lg bg-neutral-50 p-6 sm:p-8 dark:bg-neutral-900">{content}</div>
    ) : (
      content
    )
  return block.title ? (
    <Section flush={first} title={block.title}>
      {inner}
    </Section>
  ) : (
    <section className={first ? '' : 'mt-16'}>{inner}</section>
  )
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
      <section key="intro" className="mb-4">
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
            <Img
              src={image}
              sizes="(min-width: 1024px) 64rem, 100vw"
              alt={imageCaption || ''}
              className="w-full rounded-md"
            />
            {imageCaption && <figcaption className="mt-2 text-sm text-neutral-500">{imageCaption}</figcaption>}
          </figure>
        )}
      </section>
    )
  },

  // Notices from content/notices.yml with placement: home.
  notices: (first, { homeNotices, dismiss, gap }) =>
    homeNotices.length > 0 && (
      <div key="notices" className={`${first ? '' : gap} space-y-3`}>
        {homeNotices.map((n) => (
          <Notice
            key={n.id}
            text={n.text}
            link={n.link}
            style={n.style}
            onDismiss={n.dismissible ? () => dismiss(n.id) : undefined}
          />
        ))}
      </div>
    ),

  // Shown only while the Join page has at least one open position.
  hiring: (first, { gap }) => {
    const open = (join.openings || []).filter((o) => o.open)
    if (!open.length || !pageEnabled('join')) return null
    const text = home.hiring.text || `We're hiring: ${open.map((o) => o.title).join(', ')}.`
    return (
      <Notice
        key="hiring"
        text={text}
        link={{ label: home.hiring.linkLabel, url: '/join' }}
        pulse
        className={first ? '' : gap}
      />
    )
  },

  news: (first) =>
    sortedNews.length > 0 && (
      <Section key="news" flush={first} title={home.news.title} more={more('news', home.news.moreLink)}>
        <NewsList items={take(sortedNews, home.news.count)} />
      </Section>
    ),

  events: (first, { upcoming }) =>
    upcoming.length > 0 && (
      <Section key="events" flush={first} title={home.events.title} more={more('events', home.events.moreLink)}>
        <EventList events={take(upcoming, home.events.count)} />
      </Section>
    ),

  funders: (first) =>
    funders.length > 0 && (
      <Section key="funders" flush={first} title={home.funders.title}>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {funders.map((f) => {
            const mark = f.logo ? (
              <Img
                src={f.logo}
                sizes="12rem"
                alt={f.name}
                loading="lazy"
                className="h-10 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0 dark:invert"
              />
            ) : (
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{f.name}</span>
            )
            return (
              <li key={f.name}>
                {f.url ? (
                  <SmartLink to={f.url} className="hover:text-accent">
                    {mark}
                  </SmartLink>
                ) : (
                  mark
                )}
              </li>
            )
          })}
        </ul>
      </Section>
    ),

  research: (first) => {
    const active = take(
      research.filter((r) => r.status !== 'past'),
      home.research.count,
    )
    return (
      active.length > 0 && (
        <Section
          key="research"
          flush={first}
          title={home.research.title}
          more={more('research', home.research.moreLink)}
        >
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
  const events = splitEvents(useToday())
  const [homeNotices, dismiss] = useNotices('home')
  // Notices right after other notices stack closely; otherwise they get section spacing.
  const isNotice = (key) => key === 'notices' || key === 'hiring'
  const render = (key, first, prev) => {
    if (key.startsWith('block:')) {
      const block = blockById[key.slice(6)]
      return block && <TextBlock key={key} block={block} first={first} />
    }
    const gap = isNotice(key) && prev && isNotice(prev) ? 'mt-3' : 'mt-12'
    return SECTIONS[key](first, { ...events, homeNotices, dismiss, gap })
  }
  const sections = home.sections.filter((key) => SECTIONS[key] || (key.startsWith('block:') && blockById[key.slice(6)]))

  return (
    <>
      {/* Keep one h1 on the page for screen readers when the intro is turned off. */}
      {!sections.includes('intro') && <h1 className="sr-only">{site.name}</h1>}
      {sections.map((key, i) => render(key, i === 0, sections[i - 1]))}
    </>
  )
}
