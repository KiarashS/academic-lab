import { pageEnabled } from '../config/index.js'
import { formatDateRange } from '../lib/utils.js'
import SmartLink from './SmartLink.jsx'

export function calendarFile(event) {
  return `${import.meta.env.BASE_URL}events/${event.id}.ics`
}

function eventTime(event) {
  return event.time ? `${event.time}${event.end ? `–${event.end}` : ''}` : null
}

export function eventWhen(event) {
  return [formatDateRange(event.date, event.endDate), eventTime(event)].filter(Boolean).join(', ')
}

export default function EventList({ events, showCalendar = true }) {
  return (
    <ul className="space-y-8">
      {events.map((event) => {
        const page = event.hasPage && pageEnabled('events') ? `/events/${event.id}` : event.link
        return (
          <li key={event.id} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <div className="text-sm text-neutral-500 tabular-nums dark:text-neutral-400">
              <div>{formatDateRange(event.date, event.endDate)}</div>
              {event.time && <div>{eventTime(event)}</div>}
            </div>
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                {page ? (
                  <SmartLink to={page} className="hover:text-accent">
                    {event.title}
                  </SmartLink>
                ) : (
                  event.title
                )}
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
                {showCalendar && pageEnabled('events') && (
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
