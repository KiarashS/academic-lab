import LinkList from '../components/LinkList.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import Tag from '../components/Tag.jsx'
import site from '../config/index.js'
import { resources } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

function shortDate(iso) {
  const [y, m] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(site.locale || 'en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// "★ 1.2k · v2.1.0, Mar 2026 · MIT" under a repository's title.
function GithubInfo({ github }) {
  const stars = new Intl.NumberFormat(site.locale || 'en-US', { notation: 'compact' }).format(github.stars || 0)
  const parts = [
    <a key="stars" href={github.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
      <span aria-hidden="true">★ </span>
      {stars}
      <span className="sr-only"> stars on GitHub</span>
    </a>,
    github.release && (
      <a
        key="release"
        href={github.release.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent"
      >
        {github.release.tag}
        {github.release.date && `, ${shortDate(github.release.date)}`}
      </a>
    ),
    github.license && <span key="license">{github.license}</span>,
    github.archived && <span key="archived">Archived</span>,
  ].filter(Boolean)
  return (
    <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
      {parts.map((part, i) => (
        <span key={i} className="flex gap-x-2">
          {i > 0 && <span aria-hidden="true">·</span>}
          {part}
        </span>
      ))}
    </p>
  )
}

export default function Resources() {
  const config = site.resources
  useTitle(config.title)

  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      {config.sections.map((type) => {
        const items = resources.filter((r) => (r.type || 'other') === type)
        if (!items.length) return null
        return (
          <Section key={type} title={config.sectionTitles?.[type] || type}>
            <ul className="grid gap-10 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.title}>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {item.title}
                    {item.year && (
                      <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                        {item.year}
                      </span>
                    )}
                  </h3>
                  {item.github && config.github !== false && <GithubInfo github={item.github} />}
                  {item.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </p>
                  )}
                  {item.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  )}
                  {item.links?.length > 0 && <LinkList links={item.links} className="mt-3" />}
                </li>
              ))}
            </ul>
          </Section>
        )
      })}
    </>
  )
}
