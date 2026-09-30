import { Link } from 'react-router'
import site, { pageEnabled } from '../config/index.js'
import { asset } from '../lib/utils.js'
import Tag from './Tag.jsx'

// Links to the project's page only when the Research page is turned on.
export default function ProjectCard({ project }) {
  const linked = pageEnabled('research')
  const Wrapper = linked ? Link : 'div'
  return (
    <Wrapper {...(linked && { to: `/research/${project.id}` })} className="group block">
      {project.image && (
        <img
          src={asset(project.image)}
          alt=""
          loading="lazy"
          className="mb-4 aspect-[16/9] w-full rounded-md object-cover"
        />
      )}
      <h3 className={`font-medium text-neutral-900 dark:text-neutral-100 ${linked ? 'group-hover:text-accent' : ''}`}>
        {project.title}
      </h3>
      {project.summary && (
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{project.summary}</p>
      )}
      {site.research.showTags && project.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}
    </Wrapper>
  )
}
