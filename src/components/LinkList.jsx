import SmartLink from './SmartLink.jsx'

// Inline list of text links separated by dots: "Email · Website · GitHub"
export default function LinkList({ links, className = '' }) {
  const items = links.filter((l) => l.url)
  if (!items.length) return null
  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1 text-sm ${className}`}>
      {items.map((l, i) => (
        <li key={l.label} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">&middot;</span>}
          <SmartLink to={l.url} className="text-neutral-600 hover:text-accent dark:text-neutral-400">
            {l.label}
          </SmartLink>
        </li>
      ))}
    </ul>
  )
}
