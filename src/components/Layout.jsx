import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Footer from './Footer.jsx'
import Header from './Header.jsx'

export default function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
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
      <Header />
      <main id="main" tabIndex={-1} className="outline-none mx-auto w-full max-w-5xl flex-1 px-4 pt-12 sm:px-6 sm:pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
