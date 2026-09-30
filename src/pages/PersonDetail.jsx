import { Link, useParams } from 'react-router'
import Avatar from '../components/Avatar.jsx'
import LinkList from '../components/LinkList.jsx'
import { personLinks } from '../components/personLinks.js'
import ProjectCard from '../components/ProjectCard.jsx'
import PublicationList from '../components/PublicationList.jsx'
import Section from '../components/Section.jsx'
import site from '../config/site.js'
import { personById, projectsByPerson, publicationsByPerson } from '../lib/data.js'
import { paragraphs } from '../lib/utils.js'
import useTitle from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'

export default function PersonDetail() {
  const { id } = useParams()
  const person = personById[id]
  useTitle(person?.name)
  if (!person) return <NotFound />

  const pubs = publicationsByPerson(person.id)
  const projects = projectsByPerson(person.id)

  return (
    <>
      <Link to="/people" className="text-sm text-neutral-500 hover:text-accent">
        &larr; People
      </Link>

      <header className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
        <Avatar person={person} size="lg" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{person.name}</h1>
          {person.role && <p className="mt-1 text-neutral-500 dark:text-neutral-400">{person.role}</p>}
          {person.management && person.management !== person.role && site.people.management?.show && (
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              {person.management}, {(site.people.management.title || 'Management team').toLowerCase()}
            </p>
          )}
          {person.now && <p className="mt-1 text-neutral-500 dark:text-neutral-400">Now: {person.now}</p>}
          <LinkList links={personLinks(person)} className="mt-4" />
          <div className="mt-6 max-w-2xl space-y-4 leading-relaxed">
            {paragraphs(person.bio).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </header>

      {(person.interests?.length > 0 || person.education?.length > 0) && (
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          {person.interests?.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium tracking-wide text-neutral-500 uppercase">Interests</h2>
              <ul className="space-y-1">
                {person.interests.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          {person.education?.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-medium tracking-wide text-neutral-500 uppercase">Education</h2>
              <ul className="space-y-1">
                {person.education.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {projects.length > 0 && (
        <Section title="Projects">
          <div className="grid gap-10 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {pubs.length > 0 && (
        <Section title="Publications">
          <PublicationList publications={pubs} />
        </Section>
      )}
    </>
  )
}
