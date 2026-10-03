import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router'
import CookieConsent, { consentNeeded } from './CookieConsent.jsx'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import { SiteNotices } from './Notice.jsx'

export default function Layout() {
  const location = useLocation()
  const { pathname, hash } = location
  const navigationType = useNavigationType()
  const positions = useRef(new Map()) // scroll position per history entry
  const firstRender = useRef(true)
  const [announcement, setAnnouncement] = useState('')

  // The app restores scroll positions itself (see below), not the browser.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  // Remember how far down each page in the history was scrolled.
  useEffect(() => {
    const save = () => positions.current.set(location.key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [location.key])

  // On a page change: Back/Forward returns to where you were, a link to #something
  // scrolls to it, anything else starts at the top. Screen readers hear the new page's
  // title, and keyboard focus moves to the page content.
  useEffect(() => {
    const saved = positions.current.get(location.key)
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (navigationType === 'POP' && saved !== undefined) window.scrollTo({ top: saved, behavior: 'instant' })
    else if (target) target.scrollIntoView()
    else window.scrollTo({ top: 0, behavior: 'instant' })

    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setAnnouncement(document.title)
    if (!target) document.getElementById('main')?.focus({ preventScroll: true })
    // Only path and hash changes count as a new page; filter changes in ?query don't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      {/* A button, not href="#main", because hash routing would treat the fragment as a route. */}
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm dark:focus:bg-neutral-900"
      >
        Skip to content
      </button>
      <SiteNotices />
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="outline-none mx-auto w-full max-w-5xl flex-1 px-4 pt-12 sm:px-6 sm:pt-16"
      >
        <Outlet />
      </main>
      <Footer />
      {/* Read out by screen readers after each page change. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
      {consentNeeded() && <CookieConsent />}
    </div>
  )
}
