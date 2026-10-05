import { useLocation } from 'react-router'
import site, { hasSection } from '../config/index.js'
import { BUILD_DATE } from '../lib/hydration.js'
import Img from './Img.jsx'
import { consentNeeded, OPEN_EVENT } from './CookieConsent.jsx'
import LinkList from './LinkList.jsx'
import Newsletter from './Newsletter.jsx'
import SmartLink from './SmartLink.jsx'

// "Built with ♥ by <photo> <name>".
function Credit({ credit }) {
  const person = (
    <>
      {credit.avatar && (
        <Img
          src={credit.avatar}
          sizes="1.75rem"
          alt=""
          loading="lazy"
          className="size-7 rounded-full object-cover ring-2 ring-white dark:ring-neutral-950"
        />
      )}
      <span>{credit.name}</span>
    </>
  )
  return (
    <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-1.5 gap-y-1 px-4 pb-8 text-sm text-neutral-500 sm:px-6 dark:text-neutral-400">
      {credit.text}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="currentColor"
        role="img"
        aria-label="love"
        className="text-accent"
      >
        <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.1 4.4 2.5.8-1.4 2.3-2.5 4.4-2.5 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z" />
      </svg>
      {credit.by}
      {credit.url ? (
        <SmartLink
          to={credit.url}
          className="ml-0.5 inline-flex items-center gap-2 font-medium text-neutral-700 hover:text-accent dark:text-neutral-300"
        >
          {person}
        </SmartLink>
      ) : (
        <span className="ml-0.5 inline-flex items-center gap-2 font-medium text-neutral-700 dark:text-neutral-300">
          {person}
        </span>
      )}
    </p>
  )
}

export default function Footer() {
  const { footer, institution } = site
  const { pathname } = useLocation()
  if (!footer.show) return null

  // Pages that already show the full sign-up box don't repeat it in the footer.
  const path = pathname.replace(/\/$/, '') || '/'
  const placement = site.newsletter.placement || []
  const pageHasNewsletter =
    path === '/'
      ? site.home.sections.includes('newsletter')
      : path === '/news'
        ? placement.includes('news')
        : path.startsWith('/news/') && placement.includes('post')

  const year = BUILD_DATE.slice(0, 4) // the site rebuilds nightly, so this stays current
  const show = (name) => hasSection(footer.sections, name)

  return (
    <footer className="mt-24 border-t border-neutral-100 dark:border-neutral-900">
      {!pageHasNewsletter && (
        <Newsletter placement="footer" compact className="mx-auto max-w-5xl px-4 pt-8 text-sm sm:px-6" />
      )}
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
      {footer.sections?.includes('credit') && footer.credit?.name && <Credit credit={footer.credit} />}
    </footer>
  )
}
