import PageHeader from '../components/PageHeader.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/index.js'
import { teaching } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

export default function Teaching() {
  const config = site.teaching
  useTitle(config.title)
  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      <ul className="space-y-10">
        {teaching.map((c) => (
          <li key={`${c.code}-${c.term}`} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
            <div className="text-sm text-neutral-500 tabular-nums dark:text-neutral-400">{c.code}</div>
            <div>
              <h2 className="font-medium text-neutral-900 dark:text-neutral-100">
                {c.url ? (
                  <SmartLink to={c.url} className="hover:text-accent">
                    {c.title}
                  </SmartLink>
                ) : (
                  c.title
                )}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                {[c.term, config.showInstructor && c.instructor].filter(Boolean).join(' · ')}
              </p>
              {config.showDescription && c.description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {c.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
