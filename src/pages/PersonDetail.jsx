import { Link, useParams } from 'react-router'
import Avatar from '../components/Avatar.jsx'
import LinkList from '../components/LinkList.jsx'
import Markdown from '../components/Markdown.jsx'
import { personLinks } from '../components/personLinks.js'
import ProjectCard from '../components/ProjectCard.jsx'
import PublicationList from '../components/PublicationList.jsx'
import Section from '../components/Section.jsx'
import site, { pageEnabled } from '../config/index.js'
import { personById, projectsByPerson, publicationsByPerson } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'

function ListBlock({ title, items }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        {title}
      </h2>
      <ul className="space-y-1">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  )
}

export default function PersonDetail() {
  const { id } = useParams()
  const person = personById[id]
  useTitle(person?.name)
  if (!person) return <NotFound />

  const config = site.people.profile
  const show = (name) => config.sections.includes(name)
  const pubs = publicationsByPerson(person.id)
  const projects = projectsByPerson(person.id)
  const management = site.people.management

  // Sections below the header, in configured order. Interests and education share a row
  // when they are next to each other.
  const lower = config.sections.filter((s) => ['interests', 'education', 'projects', 'publications'].includes(s))
  const SECTIONS = {
    interests: () =>
      person.interests?.length > 0 && (
        <ListBlock key="interests" title={config.interestsTitle} items={person.interests} />
      ),
    education: () =>
      person.education?.length > 0 && (
        <ListBlock key="education" title={config.educationTitle} items={person.education} />
      ),
    projects: () =>
      projects.length > 0 && (
        <Section key="projects" title={config.projectsTitle}>
          <div className="grid gap-10 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      ),
    publications: () =>
      pubs.length > 0 && (
        <Section
          key="publications"
          title={config.publicationsTitle}
          more={pageEnabled('publications') && { to: `/publications?author=${person.id}`, label: 'Search and filter' }}
        >
          <PublicationList publications={pubs} />
        </Section>
      ),
  }

  // Group adjacent interests/education into one two-column row.
  const blocks = []
  for (const key of lower) {
    const el = SECTIONS[key]()
    if (!el) continue
    const last = blocks[blocks.length - 1]
    if ((key === 'interests' || key === 'education') && last?.row) last.items.push(el)
    else blocks.push(key === 'interests' || key === 'education' ? { row: true, items: [el] } : { el })
  }

  return (
    <>
      <Link to="/people" className="text-sm text-neutral-500 hover:text-accent dark:text-neutral-400">
        &larr; {site.people.title}
      </Link>

      <header className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
        {site.people.showPhotos && <Avatar person={person} size="lg" />}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{person.name}</h1>
          {person.role && <p className="mt-1 text-neutral-500 dark:text-neutral-400">{person.role}</p>}
          {person.management && person.management !== person.role && management.show && (
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              {person.management}, {management.title.toLowerCase()}
            </p>
          )}
          {person.now && <p className="mt-1 text-neutral-500 dark:text-neutral-400">Now: {person.now}</p>}
          {show('links') && <LinkList links={personLinks(person)} className="mt-4" />}
          {show('bio') && <Markdown html={person.bio} className="mt-6" />}
        </div>
      </header>

      {blocks.map((b, i) =>
        b.row ? (
          <div key={i} className="mt-12 grid gap-10 sm:grid-cols-2">
            {b.items}
          </div>
        ) : (
          b.el
        ),
      )}
    </>
  )
}
