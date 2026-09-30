import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import site, { menuItems, pagePath } from '../config/index.js'
import { asset } from '../lib/utils.js'
import ModeToggle from './ModeToggle.jsx'
import Search from './Search.jsx'

const linkClass = (active) =>
  `text-sm transition-colors ${
    active
      ? 'text-neutral-900 dark:text-neutral-50'
      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
  }`

function MenuLink({ item, className = '' }) {
  return (
    <NavLink
      to={pagePath(item.page)}
      end={item.page === 'home'}
      className={({ isActive }) => `${linkClass(isActive)} ${className}`}
    >
      {item.label}
    </NavLink>
  )
}

function isInGroup(group, pathname) {
  return group.items.some((i) => pathname === pagePath(i.page) || pathname.startsWith(pagePath(i.page) + '/'))
}

// Desktop dropdown for a { label, items } group in the menu.
function Dropdown({ group }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${linkClass(isInGroup(group, pathname))} flex cursor-pointer items-center gap-1`}
      >
        {group.label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
        </svg>
      </button>
      {open && (
        <ul className="absolute right-0 z-20 mt-3 min-w-44 rounded-md border border-neutral-200 bg-white py-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
          {group.items.map((item) => (
            <li key={item.page}>
              <MenuLink item={item} className="block px-4 py-1.5" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SearchButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search (Ctrl+K)"
      title="Search (Ctrl+K)"
      className="cursor-pointer rounded p-1.5 pointer-coarse:p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    </button>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const { pathname } = useLocation()
  const { header } = site

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Ctrl+K / Cmd+K anywhere, or "/" when not typing, opens search.
  useEffect(() => {
    if (!header.showSearch) return
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearching(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [header.showSearch])

  const tools = (
    <>
      {header.showSearch && <SearchButton onClick={() => setSearching(true)} />}
      {header.showModeToggle && <ModeToggle />}
    </>
  )

  return (
    <header className="border-b border-neutral-100 dark:border-neutral-900">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight whitespace-nowrap text-neutral-900 dark:text-neutral-50"
        >
          {header.logo && (
            <img src={asset(header.logo)} alt={header.showName ? '' : site.name} className="h-7 w-auto" />
          )}
          {header.showName && (
            <>
              <span className="hidden sm:inline">{site.name}</span>
              <span className="sm:hidden">{site.shortName || site.name}</span>
            </>
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
          {menuItems.map((item) =>
            item.items ? <Dropdown key={item.label} group={item} /> : <MenuLink key={item.page} item={item} />,
          )}
          <div className="-mr-1.5 flex items-center gap-0.5">{tools}</div>
        </nav>

        <div className="flex items-center gap-0.5 lg:hidden">
          {tools}
          {menuItems.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label="Menu"
              className="cursor-pointer rounded p-1.5 pointer-coarse:p-2 text-neutral-600 dark:text-neutral-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          )}
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-neutral-100 px-4 py-3 lg:hidden dark:border-neutral-900"
        >
          <ul className="space-y-1">
            {menuItems.map((item) =>
              item.items ? (
                <li key={item.label}>
                  <div className="pt-3 pb-1 text-xs tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                    {item.label}
                  </div>
                  <ul className="border-l border-neutral-100 pl-3 dark:border-neutral-800">
                    {item.items.map((sub) => (
                      <li key={sub.page}>
                        <MenuLink item={sub} className="block py-2" />
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.page}>
                  <MenuLink item={item} className="block py-2" />
                </li>
              ),
            )}
          </ul>
        </nav>
      )}

      {searching && <Search onClose={() => setSearching(false)} />}
    </header>
  )
}
