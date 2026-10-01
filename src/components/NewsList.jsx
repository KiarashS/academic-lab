import site, { pageEnabled } from '../config/index.js'
import { formatDayMonth } from '../lib/utils.js'
import SmartLink from './SmartLink.jsx'

// One row per item: a narrow column of small dates ("16 Feb 2026", or "16 Feb" under a
// year heading) with the text lined up beside it, and a thin rule between rows.
export default function NewsList({ items, showYear = true }) {
  return (
    <ul>
      {items.map((item) => (
        // Grid columns aligned on the first line's baseline: the small date sits on the same
        // line as the text, as on the lab blog.
        <li
          key={item.id}
          className={`grid items-baseline gap-4 border-b border-neutral-200 py-3 first:pt-0 dark:border-neutral-800 ${
            showYear ? 'grid-cols-[5.5rem_minmax(0,1fr)]' : 'grid-cols-[3.5rem_minmax(0,1fr)]'
          }`}
        >
          <time
            dateTime={item.date}
            className="text-[0.8rem] leading-[1.625rem] text-neutral-500 tabular-nums dark:text-neutral-400"
          >
            {formatDayMonth(item.date, showYear)}
          </time>
          <p className="leading-[1.625rem]">
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
