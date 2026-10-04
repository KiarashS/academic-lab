import { peopleNames } from '../lib/data.js'
import Authors from './Authors.jsx'
import LooseDate from './LooseDate.jsx'
import SmartLink from './SmartLink.jsx'

export default function AwardList({ awards, showRecipients = true }) {
  return (
    <ul className="space-y-6">
      {awards.map((award) => (
        <li key={award.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-4">
          <LooseDate value={award.date} className="text-[0.8rem] leading-6 text-neutral-500 dark:text-neutral-400" />
          <div>
            <h3 className="leading-6 font-medium text-neutral-900 dark:text-neutral-100">
              {award.link ? <SmartLink to={award.link}>{award.title}</SmartLink> : award.title}
            </h3>
            {award.by && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{award.by}</p>}
            {(showRecipients ? award.recipients.length > 0 : award.recipients.length > 1) && (
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                <Authors authors={peopleNames(award.recipients)} />
              </p>
            )}
            {award.description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {award.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
