import PageHeader from '../components/PageHeader.jsx'
import PersonCard from '../components/PersonCard.jsx'
import Section from '../components/Section.jsx'
import site from '../config/index.js'
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

// Current members grouped as configured, with the management team slotted in.
function memberGroups() {
  const { groups, management } = site.people
  // Anyone with a group that isn't listed in the config still shows up, under "Other".
  const known = new Set(groups)
  const list = [
    ...groups.map((g) => ({ title: g, people: currentMembers.filter((p) => p.group === g) })),
    { title: 'Other', people: currentMembers.filter((p) => p.group && !known.has(p.group)) },
  ]
  if (management.show) {
    const team = currentMembers.filter((p) => p.management)
    const index = management.after ? list.findIndex((s) => s.title === management.after) + 1 : 0
    list.splice(index, 0, { title: management.title, people: team, management: true })
  }
  return list
}

export default function People() {
  const config = site.people
  useTitle(config.title)

  const SECTIONS = {
    members: () =>
      memberGroups().map(
        (g) =>
          g.people.length > 0 && (
            <Section key={g.title} title={g.title}>
              <PeopleGrid people={g.people} management={g.management} />
            </Section>
          ),
      ),
    alumni: () =>
      alumni.length > 0 && (
        <Section key="alumni" title={config.alumniTitle}>
          <PeopleGrid people={alumni} />
        </Section>
      ),
  }

  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      {config.sections.map((key) => SECTIONS[key]?.())}
    </>
  )
}
