import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import site from '../config/site.js'
import { asset } from '../lib/utils.js'
import ModeToggle from './ModeToggle.jsx'

const navClass = ({ isActive }) =>
  `text-sm transition-colors ${
    isActive
      ? 'text-neutral-900 dark:text-neutral-50'
      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
  }`

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="border-b border-neutral-100 dark:border-neutral-900">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {site.logo && <img src={asset(site.logo)} alt="" className="h-7 w-auto" />}
          <span className="hidden sm:inline">{site.name}</span>
          <span className="sm:hidden">{site.shortName || site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {site.nav.map((item) => (
            <NavLink key={item.page} to={`/${item.page}`} className={navClass}>
              {item.label}
            </NavLink>
          ))}
          {site.theme.showModeToggle && <ModeToggle />}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          {site.theme.showModeToggle && <ModeToggle />}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Menu"
            className="cursor-pointer rounded p-1.5 text-neutral-600 dark:text-neutral-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-neutral-100 px-4 py-3 md:hidden dark:border-neutral-900">
          <ul className="space-y-1">
            {site.nav.map((item) => (
              <li key={item.page}>
                <NavLink to={`/${item.page}`} className={(s) => `${navClass(s)} block py-2`}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
