import site, { hasSection } from '../config/index.js'
import { BUILD_DATE } from '../lib/hydration.js'
import { consentNeeded, OPEN_EVENT } from './CookieConsent.jsx'
import LinkList from './LinkList.jsx'
import SmartLink from './SmartLink.jsx'

export default function Footer() {
  const { footer, institution } = site
  if (!footer.show) return null

  const year = BUILD_DATE.slice(0, 4) // the site rebuilds nightly, so this stays current
  const show = (name) => hasSection(footer.sections, name)

  return (
    <footer className="mt-24 border-t border-neutral-100 dark:border-neutral-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-neutral-400">
        <div>
          {show('copyright') && <p>{footer.text || `© ${year} ${site.name}`}</p>}
          {show('institution') && institution?.name && (
            <p className="mt-1">
              {institution.url ? (
                <SmartLink to={institution.url} className="hover:text-accent">
                  {institution.name}
                </SmartLink>
              ) : (
                institution.name
              )}
            </p>
          )}
          {consentNeeded() && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
              className="mt-1 block cursor-pointer hover:text-accent"
            >
              Cookie settings
            </button>
          )}
        </div>
        {show('social') && <LinkList links={footer.social} />}
      </div>
    </footer>
  )
}
