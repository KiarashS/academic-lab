import { Link, useParams } from 'react-router'
import LinkList from '../components/LinkList.jsx'
import PersonCard from '../components/PersonCard.jsx'
import PublicationItem from '../components/PublicationItem.jsx'
import Section from '../components/Section.jsx'
import Tag from '../components/Tag.jsx'
import { personById, projectById, publicationsByProject } from '../lib/data.js'
import { asset, paragraphs } from '../lib/utils.js'
import useTitle from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'

export default function ProjectDetail() {
  const { id } = useParams()
  const project = projectById[id]
  useTitle(project?.title)
  if (!project) return <NotFound />

  const members = (project.members || []).map((m) => personById[m]).filter(Boolean)
  const pubs = publicationsByProject(project.id)

  return (
    <>
      <Link to="/research" className="text-sm text-neutral-500 hover:text-accent">
        &larr; Research
      </Link>
      <header className="mt-6 mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{project.title}</h1>
        {project.status === 'past' && <p className="mt-2 text-sm text-neutral-500">Completed project</p>}
        {project.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
      </header>

      {project.image && <img src={asset(project.image)} alt="" className="mb-10 w-full rounded-md" />}

      <div className="max-w-2xl space-y-4 leading-relaxed">
        {paragraphs(project.description || project.summary).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {project.funding && <p className="text-sm text-neutral-500">Funding: {project.funding}</p>}
      </div>

      {project.links?.length > 0 && <LinkList links={project.links} className="mt-6" />}

      {members.length > 0 && (
        <Section title="People">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        </Section>
      )}

      {pubs.length > 0 && (
        <Section title="Publications">
          <div className="space-y-7">
            {pubs.map((pub) => (
              <PublicationItem key={pub.id} pub={pub} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
