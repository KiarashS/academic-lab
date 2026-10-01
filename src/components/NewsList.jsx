import site, { pageEnabled } from '../config/index.js'
import DateParts from './DateParts.jsx'
import SmartLink from './SmartLink.jsx'

// One row per item: a narrow column of small dates ("08 Sep 2026", or "08 Sep" under a
// year heading, with days, months and years lined up) beside the text.
export default function NewsList({ items, showYear = true }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        // Grid columns aligned on the first line's baseline, so the small date sits on the
        // same line as the text.
        <li
          key={item.id}
          className={`grid items-baseline gap-4 ${
            showYear ? 'grid-cols-[5.5rem_minmax(0,1fr)]' : 'grid-cols-[3.5rem_minmax(0,1fr)]'
          }`}
        >
          <DateParts
            iso={item.date}
            showYear={showYear}
            className="text-[0.8rem] leading-[1.625rem] text-neutral-500 dark:text-neutral-400"
          />
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
