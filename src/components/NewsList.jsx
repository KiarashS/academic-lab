import site, { pageEnabled } from '../config/index.js'
import { formatDayMonth } from '../lib/utils.js'
import SmartLink from './SmartLink.jsx'

// One row per item: a narrow column of small dates ("16 Feb 2026", or "16 Feb" under a
// year heading) with the text lined up beside it, and a thin rule between rows.
export default function NewsList({ items, showYear = true }) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-baseline gap-4 border-b border-neutral-200 py-3 first:pt-0 dark:border-neutral-800"
        >
          <time
            dateTime={item.date}
            className={`shrink-0 text-[0.8rem] text-neutral-500 tabular-nums dark:text-neutral-400 ${showYear ? 'w-[5.5rem]' : 'w-14'}`}
          >
            {formatDayMonth(item.date, showYear)}
          </time>
          <p className="min-w-0 leading-relaxed">
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
