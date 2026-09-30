import { Link } from 'react-router'
import site, { pageEnabled } from '../config/index.js'
import Avatar from './Avatar.jsx'

// `role` overrides the person's own role, e.g. to show their management title.
// Links to the person's page only when the People page is turned on.
export default function PersonCard({ person, role = person.role }) {
  const linked = pageEnabled('people')
  const Wrapper = linked ? Link : 'div'
  return (
    <Wrapper {...(linked && { to: `/people/${person.id}` })} className="group flex items-center gap-4">
      {site.people.showPhotos && <Avatar person={person} size="sm" />}
      <div>
        <div
          className={`font-medium text-neutral-900 dark:text-neutral-100 ${linked ? 'group-hover:text-accent' : ''}`}
        >
          {person.name}
        </div>
        {role && <div className="text-sm text-neutral-500 dark:text-neutral-400">{role}</div>}
        {person.now && <div className="text-sm text-neutral-500 dark:text-neutral-400">Now: {person.now}</div>}
      </div>
    </Wrapper>
  )
}
