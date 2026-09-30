import PageHeader from '../components/PageHeader.jsx'
import PersonCard from '../components/PersonCard.jsx'
import Section from '../components/Section.jsx'
import site from '../config/site.js'
import { alumni, currentMembers } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

export default function People() {
  useTitle('People')
  const { groups, showAlumni } = site.people

  // Anyone whose group isn't listed in the config still shows up, under "Other".
  const known = new Set(groups)
  const others = currentMembers.filter((p) => !known.has(p.group))
  const sections = [
    ...groups.map((g) => [g, currentMembers.filter((p) => p.group === g)]),
    ['Other', others],
  ]

  return (
    <>
      <PageHeader title="People" />
      {sections.map(
        ([title, members]) =>
          members.length > 0 && (
            <Section key={title} title={title}>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((p) => (
                  <PersonCard key={p.id} person={p} />
                ))}
              </div>
            </Section>
          ),
      )}
      {showAlumni && alumni.length > 0 && (
        <Section title="Alumni">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {alumni.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
