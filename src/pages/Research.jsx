import PageHeader from '../components/PageHeader.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import Section from '../components/Section.jsx'
import site from '../config/index.js'
import { research } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

export default function Research() {
  const config = site.research
  useTitle(config.title)

  const groups = {
    current: { title: config.currentTitle, items: research.filter((r) => r.status !== 'past') },
    past: { title: config.pastTitle, items: research.filter((r) => r.status === 'past') },
  }

  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      {config.sections.map((key) => {
        const group = groups[key]
        if (!group?.items.length) return null
        return (
          <Section key={key} title={group.title}>
            <div className="grid gap-10 sm:grid-cols-2">
              {group.items.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Section>
        )
      })}
    </>
  )
}
