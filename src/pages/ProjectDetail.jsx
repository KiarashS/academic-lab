import { Link, useParams } from 'react-router'
import LinkList from '../components/LinkList.jsx'
import Markdown from '../components/Markdown.jsx'
import PersonCard from '../components/PersonCard.jsx'
import PublicationItem from '../components/PublicationItem.jsx'
import Section from '../components/Section.jsx'
import Tag from '../components/Tag.jsx'
import site from '../config/index.js'
import { personById, projectById, publicationsByProject } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'
import Img from '../components/Img.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const project = projectById[id]
  useTitle(project?.title)
  if (!project) return <NotFound />

  const config = site.research.project
  const members = (project.members || []).map((m) => personById[m]).filter(Boolean)
  const pubs = publicationsByProject(project.id)

  const SECTIONS = {
    description: () =>
      project.description ? (
        <Markdown key="description" html={project.description} className="mt-8" />
      ) : (
        project.summary && (
          <p key="description" className="mt-8 max-w-2xl leading-relaxed">
            {project.summary}
          </p>
        )
      ),
    funding: () =>
      project.funding && (
        <p key="funding" className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Funding: {project.funding}
        </p>
      ),
    links: () => project.links?.length > 0 && <LinkList key="links" links={project.links} className="mt-6" />,
    people: () =>
      members.length > 0 && (
        <Section key="people" title={config.peopleTitle}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        </Section>
      ),
    publications: () =>
      pubs.length > 0 && (
        <Section key="publications" title={config.publicationsTitle}>
          <div className="space-y-7">
            {pubs.map((pub) => (
              <PublicationItem key={pub.id} pub={pub} />
            ))}
          </div>
        </Section>
      ),
  }

  return (
    <>
      <Link to="/research" className="text-sm text-neutral-500 hover:text-accent dark:text-neutral-400">
        &larr; {site.research.title}
      </Link>
      <header className="mt-6 mb-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{project.title}</h1>
        {project.status === 'past' && <p className="mt-2 text-sm text-neutral-500">Completed project</p>}
        {site.research.showTags && project.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
      </header>

      {project.image && (
        <Img src={project.image} sizes="(min-width: 1024px) 64rem, 100vw" className="mt-8 w-full rounded-md" />
      )}

      {config.sections.map((key) => SECTIONS[key]?.())}
    </>
  )
}
