import { Link } from 'react-router'
import { asset } from '../lib/utils.js'
import Tag from './Tag.jsx'

export default function ProjectCard({ project }) {
  return (
    <Link to={`/research/${project.id}`} className="group block">
      {project.image && (
        <img
          src={asset(project.image)}
          alt=""
          loading="lazy"
          className="mb-4 aspect-[16/9] w-full rounded-md object-cover"
        />
      )}
      <h3 className="font-medium text-neutral-900 group-hover:text-accent dark:text-neutral-100">{project.title}</h3>
      {project.summary && (
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{project.summary}</p>
      )}
      {project.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}
    </Link>
  )
}
