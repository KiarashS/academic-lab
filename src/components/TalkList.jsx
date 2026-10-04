import site from '../config/index.js'
import { peopleNames } from '../lib/data.js'
import Authors from './Authors.jsx'
import DateParts from './DateParts.jsx'
import SmartLink from './SmartLink.jsx'

const LINK_LABELS = {
  slides: 'Slides',
  video: 'Video',
  event: 'Event page',
  code: 'Code',
  pdf: 'PDF',
  poster: 'Poster',
}

// `links: { slides: url, video: url, ... }` as labelled links, in the order written.
export function linkEntries(links = {}) {
  return Object.entries(links)
    .filter(([, url]) => url)
    .map(([key, url]) => ({ label: LINK_LABELS[key] || key[0].toUpperCase() + key.slice(1), url }))
}

// One row per talk, with the same date column as the news and events lists.
// showSpeakers={false} (on a person's own page) still lists the speakers of shared talks.
export default function TalkList({ talks, showYear = true, showSpeakers = true }) {
  const types = site.talks.types || {}
  return (
    <ul className="space-y-8">
      {talks.map((talk) => (
        <li
          key={talk.id}
          className={`grid items-baseline gap-4 ${
            showYear ? 'grid-cols-[5.5rem_minmax(0,1fr)]' : 'grid-cols-[3.5rem_minmax(0,1fr)]'
          }`}
        >
          <div className="text-[0.8rem] leading-6 text-neutral-500 dark:text-neutral-400">
            {talk.date && <DateParts iso={talk.date} showYear={showYear} />}
          </div>
          <div>
            <h3 className="leading-6 font-medium text-neutral-900 dark:text-neutral-100">
              {talk.title}
              {talk.type && types[talk.type] && (
                <span className="ml-2 align-baseline text-xs font-normal whitespace-nowrap text-accent">
                  {types[talk.type]}
                </span>
              )}
            </h3>
            {(showSpeakers ? talk.speakers.length > 0 : talk.speakers.length > 1) && (
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                <Authors authors={peopleNames(talk.speakers)} />
              </p>
            )}
            {(talk.event || talk.location) && (
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                {[talk.event, talk.location].filter(Boolean).join(' · ')}
              </p>
            )}
            {talk.abstract && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {talk.abstract}
              </p>
            )}
            {talk.links && linkEntries(talk.links).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-4 text-sm pointer-coarse:[&>*]:py-0.5">
                {linkEntries(talk.links).map((l) => (
                  <SmartLink key={l.label} to={l.url}>
                    {l.label}
                  </SmartLink>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
