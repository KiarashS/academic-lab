import { asset, initials } from '../lib/utils.js'

const SIZES = { sm: 'size-16 text-base', md: 'size-24 text-xl', lg: 'size-40 text-3xl' }

export default function Avatar({ person, size = 'md' }) {
  const cls = `${SIZES[size]} shrink-0 rounded-full object-cover`
  if (person.photo) {
    return <img src={asset(person.photo)} alt={person.name} className={cls} loading="lazy" />
  }
  return (
    <div
      aria-hidden="true"
      className={`${cls} flex items-center justify-center bg-neutral-100 font-medium text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500`}
    >
      {initials(person.name)}
    </div>
  )
}
