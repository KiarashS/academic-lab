import LinkList from '../components/LinkList.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import Tag from '../components/Tag.jsx'
import site from '../config/index.js'
import { resources } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

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
