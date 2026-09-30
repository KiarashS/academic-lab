import SmartLink from './SmartLink.jsx'

// Inline row of text links: "Email  Website  GitHub"
export default function LinkList({ links, className = '' }) {
  const items = links.filter((l) => l.url)
  if (!items.length) return null
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className}`}>
      {items.map((l) => (
        <li key={l.label}>
          <SmartLink to={l.url} className="text-neutral-600 hover:text-accent dark:text-neutral-400">
            {l.label}
          </SmartLink>
        </li>
      ))}
    </ul>
  )
}
