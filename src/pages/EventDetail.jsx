import { Link, useParams } from 'react-router'
import DateParts from '../components/DateParts.jsx'
import { calendarFile } from '../components/EventList.jsx'
import Markdown from '../components/Markdown.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/index.js'
import { eventById } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'

export default function EventDetail() {
  const { id } = useParams()
  const event = eventById[id]
  useTitle(event?.title)
  if (!event?.hasPage) return <NotFound />

  const details = [
    [
      'When',
      // Same date columns as the lists ("08 Sep 2026"), then the time.
      <>
        <DateParts iso={event.date} />
        {event.endDate && event.endDate !== event.date && (
          <>
            <span aria-hidden="true"> – </span>
            <span className="sr-only"> to </span>
            <DateParts iso={event.endDate} />
          </>
        )}
        {event.time && (
          <span className="ml-3 tabular-nums">
            {event.time}
            {event.end && `–${event.end}`}
          </span>
        )}
      </>,
    ],
    ['Speaker', event.speaker && [event.speaker, event.affiliation].filter(Boolean).join(', ')],
    ['Where', event.location],
  ].filter(([, v]) => v)

  return (
    <article>
      <Link to="/events" className="text-sm text-neutral-500 hover:text-accent dark:text-neutral-400">
        &larr; {site.events.title}
      </Link>
      <h1 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        {event.title}
      </h1>
      {event.summary && (
        <p className="mt-3 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">{event.summary}</p>
      )}

      <dl className="mt-8 grid max-w-2xl gap-x-6 gap-y-2 sm:grid-cols-[6rem_1fr] sm:items-baseline">
        {details.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-sm text-neutral-500 dark:text-neutral-400">{label}</dt>
            <dd className="mb-2 sm:mb-0">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex flex-wrap gap-x-4 text-sm pointer-coarse:[&>*]:py-0.5">
        <a href={calendarFile(event)} download className="prose-link">
          Add to calendar
        </a>
        {event.link && <SmartLink to={event.link}>Event link</SmartLink>}
      </div>

      <Markdown html={event.html} className="mt-10" />
    </article>
  )
}
