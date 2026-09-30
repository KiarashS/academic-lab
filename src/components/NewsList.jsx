import { formatDate } from '../lib/utils.js'
import SmartLink from './SmartLink.jsx'

export default function NewsList({ items }) {
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
          <time dateTime={item.date} className="text-sm text-neutral-400 tabular-nums dark:text-neutral-500">
            {formatDate(item.date)}
          </time>
          <p className="leading-relaxed">
            {item.text}
            {item.link && (
              <>
                {' '}
                <SmartLink to={item.link.url}>{item.link.label}</SmartLink>
              </>
            )}
            {item.internal && (
              <>
                {' '}
                <SmartLink to={item.internal}>{item.linkLabel || 'More'}</SmartLink>
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  )
}
