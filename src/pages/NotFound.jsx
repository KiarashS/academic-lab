import { Link } from 'react-router'
import { OPEN_SEARCH_EVENT } from '../components/Header.jsx'
import site, { navPages, pagePath } from '../config/index.js'
import useTitle from '../lib/useTitle.js'

// Shown for unknown URLs: a way back in, through search or the site's main pages.
export default function NotFound() {
  useTitle('Not found')
  const pages = navPages.filter((p) => p.menu !== false)

  return (
    <div className="py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Page not found</h1>
      <p className="mt-4 max-w-xl text-neutral-600 dark:text-neutral-400">
        This page doesn't exist, or it has moved.{' '}
        {site.header.showSearch && (
          <>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
              className="prose-link cursor-pointer"
            >
              Search the site
            </button>{' '}
            or go to one of these pages:
          </>
        )}
        {!site.header.showSearch && 'Try one of these pages:'}
      </p>
      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
        {pages.map((p) => (
          <li key={p.page}>
            <Link to={pagePath(p.page)} className="prose-link">
              {site[p.page]?.title || p.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
