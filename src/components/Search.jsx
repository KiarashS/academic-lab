import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { search } from '../lib/search.js'

export default function Search({ onClose }) {
  const dialog = useRef(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const listId = useId()
  const results = useMemo(() => search(query), [query])

  useEffect(() => {
    dialog.current.showModal()
  }, [])

  useEffect(() => setActive(0), [query])

  const go = (result) => {
    dialog.current.close()
    navigate(result.url)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active])
    }
  }

  // Keep the highlighted result in view while moving with the arrow keys.
  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
      aria-label="Search"
      className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-xl rounded-lg border border-neutral-200 bg-white p-0 text-neutral-800 shadow-2xl backdrop:bg-black/30 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
    >
      <div className="flex items-center gap-3 border-b border-neutral-100 px-4 dark:border-neutral-900">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="shrink-0 text-neutral-400"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search people, projects, papers, news…"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
          aria-label="Search the site"
          className="h-14 w-full bg-transparent text-base outline-none focus-visible:outline-none placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd className="hidden rounded border border-neutral-200 px-1.5 text-xs text-neutral-400 sm:block dark:border-neutral-800">
          Esc
        </kbd>
      </div>

      {query && (
        <ul id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-500">No results for “{query}”.</li>
          )}
          {results.map((r, i) => (
            <li
              key={`${r.type}-${r.url}-${r.title}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => go(r)}
              className={`flex cursor-pointer flex-col px-4 py-2 sm:flex-row sm:items-baseline sm:gap-3 ${i === active ? 'bg-neutral-100 dark:bg-neutral-900' : ''}`}
            >
              <span className="shrink-0 text-xs text-neutral-500 sm:w-20 dark:text-neutral-400">{r.type}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-neutral-900 dark:text-neutral-100">{r.title}</span>
                {r.subtitle && (
                  <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{r.subtitle}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </dialog>
  )
}
