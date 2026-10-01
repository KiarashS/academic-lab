import { useEffect, useState } from 'react'
import { notices } from '../lib/data.js'
import { useHydrated, useToday } from '../lib/hydration.js'
import SmartLink from './SmartLink.jsx'

// Colors per style: [box, dot]. "accent" follows the site's accent color.
const STYLES = {
  accent: ['border-accent/20 bg-accent/5', 'bg-accent'],
  info: ['border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900', 'bg-neutral-400'],
  success: [
    'border-emerald-600/20 bg-emerald-600/5 dark:border-emerald-400/20 dark:bg-emerald-400/5',
    'bg-emerald-600 dark:bg-emerald-400',
  ],
  warning: [
    'border-amber-600/25 bg-amber-500/10 dark:border-amber-400/25 dark:bg-amber-400/10',
    'bg-amber-500 dark:bg-amber-400',
  ],
}

const KEY = 'dismissed-notices'

function readDismissed() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

// Notices from content/notices.yml that are within their dates and not closed by this
// visitor. Closed notices are only known after hydration (they're in localStorage).
export function useNotices(placement) {
  const today = useToday()
  const hydrated = useHydrated()
  const [dismissed, setDismissed] = useState([])
  useEffect(() => setDismissed(readDismissed()), [])

  const visible = notices.filter(
    (n) =>
      (n.placement || 'home') === placement &&
      (!n.from || n.from <= today) &&
      (!n.until || n.until >= today) &&
      !(hydrated && dismissed.includes(n.id)),
  )
  const dismiss = (id) => {
    const next = [...new Set([...readDismissed(), id])]
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // Storage blocked; the notice is hidden for this visit only.
    }
    setDismissed(next)
  }
  return [visible, dismiss]
}

function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close notice"
      className="-m-1.5 shrink-0 cursor-pointer rounded p-1.5 text-neutral-400 hover:text-neutral-700 pointer-coarse:p-2 dark:hover:text-neutral-200"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  )
}

// A notice box: a colored dot, the text, an optional link and an optional close button.
export default function Notice({ text, link, style = 'accent', pulse = false, onDismiss, className = '' }) {
  const [box, dot] = STYLES[style] || STYLES.accent
  return (
    <aside className={`flex items-start gap-3 rounded-lg border px-5 py-4 sm:items-center ${box} ${className}`}>
      <span aria-hidden="true" className="relative mt-2 flex size-2.5 shrink-0 sm:mt-0">
        {pulse && (
          <span
            className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${dot}`}
          />
        )}
        <span className={`relative inline-flex size-2.5 rounded-full ${dot}`} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-neutral-800 dark:text-neutral-200">{text}</p>
        {link?.url && (
          <SmartLink to={link.url} className="prose-link shrink-0 text-sm pointer-coarse:py-1">
            {link.label || 'More'} &rarr;
          </SmartLink>
        )}
      </div>
      {onDismiss && <CloseButton onClick={onDismiss} />}
    </aside>
  )
}

// Slim bar above the header on every page, for notices with placement: site.
export function SiteNotices() {
  const [visible, dismiss] = useNotices('site')
  if (!visible.length) return null
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-900">
      {visible.map((n) => {
        const [box, dot] = STYLES[n.style] || STYLES.accent
        return (
          <div key={n.id} role="region" aria-label="Notice" className={`border-0 ${box} rounded-none`}>
            <div className="mx-auto flex max-w-5xl items-start gap-3 px-4 py-2.5 text-sm sm:items-center sm:px-6">
              <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full sm:mt-0 ${dot}`} />
              <p className="flex-1 text-neutral-700 dark:text-neutral-300">
                {n.text}
                {n.link?.url && (
                  <>
                    {' '}
                    <SmartLink to={n.link.url} className="prose-link whitespace-nowrap">
                      {n.link.label || 'More'} &rarr;
                    </SmartLink>
                  </>
                )}
              </p>
              {n.dismissible && <CloseButton onClick={() => dismiss(n.id)} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
