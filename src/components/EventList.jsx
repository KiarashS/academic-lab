import site, { pageEnabled } from '../config/index.js'
import DateParts from './DateParts.jsx'
import SmartLink from './SmartLink.jsx'

export function calendarFile(event) {
  return `${import.meta.env.BASE_URL}events/${event.id}.ics`
}

function eventTime(event) {
  return event.time ? `${event.time}${event.end ? `–${event.end}` : ''}` : null
}

export default function EventList({ events, showCalendar = true }) {
  return (
    <ul className="space-y-8">
      {events.map((event) => {
        const page = event.hasPage && pageEnabled('events') ? `/events/${event.id}` : event.link
        return (
          // Same date column as the news list: days, months and years line up from row to
          // row, and the date shares the title's baseline. A multi-day event shows its last
          // day on the next line after a hanging dash; the time goes below.
          <li key={event.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4">
            <div className="text-[0.8rem] leading-6 text-neutral-500 dark:text-neutral-400">
              <DateParts iso={event.date} className="block" />
              {event.endDate && event.endDate !== event.date && (
                <span className="block whitespace-nowrap">
                  <span aria-hidden="true" className="-ml-[0.9em] inline-block w-[0.9em]">
                    –
                  </span>
                  <span className="sr-only">to </span>
                  <DateParts iso={event.endDate} />
                </span>
              )}
              {event.time && <span className="block tabular-nums">{eventTime(event)}</span>}
            </div>
            <div>
              <h3 className="leading-6 font-medium text-neutral-900 dark:text-neutral-100">
                {page ? <SmartLink to={page}>{event.title}</SmartLink> : event.title}
              </h3>
              {event.speaker && (
                <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {event.speaker}
                  {event.affiliation && `, ${event.affiliation}`}
                </p>
              )}
              {event.location && (
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{event.location}</p>
              )}
              {event.summary && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {event.summary}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 text-sm pointer-coarse:[&>*]:py-0.5">
                {event.link && event.hasPage && <SmartLink to={event.link}>Event link</SmartLink>}
                {showCalendar && site.events.calendarLinks && pageEnabled('events') && (
                  <a href={calendarFile(event)} download className="prose-link">
                    Add to calendar
                  </a>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
