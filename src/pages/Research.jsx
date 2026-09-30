import ProjectCard from '../components/ProjectCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import research from '../content/research.js'
import useTitle from '../lib/useTitle.js'

export default function Research() {
  useTitle('Research')
  const active = research.filter((r) => r.status !== 'past')
  const past = research.filter((r) => r.status === 'past')

  return (
    <>
      <PageHeader title="Research" intro="Current and past projects in the lab." />
      {[
        ['Current projects', active],
        ['Past projects', past],
      ].map(
        ([title, items]) =>
          items.length > 0 && (
            <Section key={title} title={title}>
              <div className="grid gap-10 sm:grid-cols-2">
                {items.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </Section>
          ),
      )}
    </>
  )
}
