import { Link } from 'react-router'
import Avatar from './Avatar.jsx'

export default function PersonCard({ person }) {
  return (
    <Link to={`/people/${person.id}`} className="group flex items-center gap-4">
      <Avatar person={person} size="sm" />
      <div>
        <div className="font-medium text-neutral-900 group-hover:text-accent dark:text-neutral-100">{person.name}</div>
        {person.role && <div className="text-sm text-neutral-500 dark:text-neutral-400">{person.role}</div>}
        {person.now && <div className="text-sm text-neutral-500 dark:text-neutral-400">Now: {person.now}</div>}
      </div>
    </Link>
  )
}
