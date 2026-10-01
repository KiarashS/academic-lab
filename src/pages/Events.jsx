import EventList from '../components/EventList.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import site from '../config/index.js'
import { splitEvents } from '../lib/data.js'
import { useToday } from '../lib/hydration.js'
import useTitle from '../lib/useTitle.js'

export default function Events() {
  const config = site.events
  useTitle(config.title)
  const { upcoming: upcomingEvents, past: pastEvents } = splitEvents(useToday())

  const feed = `${import.meta.env.BASE_URL}events.ics`
  // webcal:// makes calendar apps subscribe (and keep updating) instead of importing once.
  const webcal = site.url ? `${site.url.replace(/^https?:/, 'webcal:').replace(/\/$/, '')}/events.ics` : null

  const groups = {
    upcoming: { title: config.upcomingTitle, items: upcomingEvents, empty: 'No upcoming events right now.' },
    past: { title: config.pastTitle, items: pastEvents },
  }

  return (
    <>
      <PageHeader title={config.title} intro={config.intro}>
        {config.showSubscribe && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            {webcal && (
              <>
                <a href={webcal} className="prose-link">
                  Subscribe to the calendar
                </a>{' '}
                or{' '}
              </>
            )}
            <a href={feed} download className="prose-link">
              download it as a .ics file
            </a>
            .
          </p>
        )}
      </PageHeader>
      {config.sections.map((key) => {
        const group = groups[key]
        if (!group) return null
        if (!group.items.length && !group.empty) return null
        return (
          <Section key={key} title={group.title}>
            {group.items.length ? (
              <EventList events={group.items} showCalendar={key === 'upcoming'} />
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400">{group.empty}</p>
            )}
          </Section>
        )
      })}
    </>
  )
}
