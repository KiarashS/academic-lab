import { Link } from 'react-router'
import Avatar from './Avatar.jsx'

// `role` overrides the person's own role, e.g. to show their management title.
export default function PersonCard({ person, role = person.role }) {
  return (
    <Link to={`/people/${person.id}`} className="group flex items-center gap-4">
      <Avatar person={person} size="sm" />
      <div>
        <div className="font-medium text-neutral-900 group-hover:text-accent dark:text-neutral-100">{person.name}</div>
        {role && <div className="text-sm text-neutral-500 dark:text-neutral-400">{role}</div>}
        {person.now && <div className="text-sm text-neutral-500 dark:text-neutral-400">Now: {person.now}</div>}
      </div>
    </Link>
  )
}
