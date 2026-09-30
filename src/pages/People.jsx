import PageHeader from '../components/PageHeader.jsx'
import PersonCard from '../components/PersonCard.jsx'
import Section from '../components/Section.jsx'
import site from '../config/site.js'
import { alumni, currentMembers } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

function PeopleGrid({ people, management = false }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p) => (
        <PersonCard key={p.id} person={p} role={management ? p.management : p.role} />
      ))}
    </div>
  )
}

export default function People() {
  useTitle('People')
  const { groups, showAlumni, management } = site.people

  // Anyone with a group that isn't listed in the config still shows up, under "Other".
  const known = new Set(groups)
  const others = currentMembers.filter((p) => p.group && !known.has(p.group))
  const sections = [
    ...groups.map((g) => ({ title: g, people: currentMembers.filter((p) => p.group === g) })),
    { title: 'Other', people: others },
  ]

  if (management?.show) {
    const team = currentMembers.filter((p) => p.management)
    const index = management.after ? sections.findIndex((s) => s.title === management.after) + 1 : 0
    sections.splice(index, 0, { title: management.title || 'Management team', people: team, management: true })
  }

  return (
    <>
      <PageHeader title="People" />
      {sections.map(
        (s) =>
          s.people.length > 0 && (
            <Section key={s.title} title={s.title}>
              <PeopleGrid people={s.people} management={s.management} />
            </Section>
          ),
      )}
      {showAlumni && alumni.length > 0 && (
        <Section title="Alumni">
          <PeopleGrid people={alumni} />
        </Section>
      )}
    </>
  )
}
