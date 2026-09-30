import site, { pageEnabled } from '../config/index.js'
import { formatDate } from '../lib/utils.js'
import SmartLink from './SmartLink.jsx'

export default function NewsList({ items }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
          <time dateTime={item.date} className="text-sm text-neutral-500 tabular-nums dark:text-neutral-400">
            {formatDate(item.date)}
          </time>
          <p className="leading-relaxed">
            {item.text || item.title}
            {item.link?.url && (
              <>
                {' '}
                <SmartLink to={item.link.url}>{item.link.label || 'Link'}</SmartLink>
              </>
            )}
            {item.hasPage && pageEnabled('news') && (
              <>
                {' '}
                <SmartLink to={`/news/${item.id}`}>{site.news.readMore}</SmartLink>
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  )
}
