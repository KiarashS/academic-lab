import { useEffect, useState } from 'react'
import site from '../config/index.js'

// Asks before loading Google Analytics, which sets cookies. Only used when
// analytics.googleAnalytics and analytics.cookieConsent are both set in site.js.
const KEY = 'analytics-consent' // 'granted' | 'denied'
export const OPEN_EVENT = 'open-cookie-settings'

export function consentNeeded() {
  const { googleAnalytics, cookieConsent } = site.analytics || {}
  return Boolean(googleAnalytics && cookieConsent)
}

function loadGoogleAnalytics(id) {
  if (window.gtag) return
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments) // eslint-disable-line prefer-rest-params
  }
  window.gtag('js', new Date())
  window.gtag('config', id)
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.append(script)
}

function read() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function save(value) {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    // Storage blocked; the choice applies to this visit only.
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false)
  const id = site.analytics.googleAnalytics

  useEffect(() => {
    const choice = read()
    if (choice === 'granted') loadGoogleAnalytics(id)
    else if (!choice) setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [id])

  if (!open) return null

  const choose = (value) => {
    save(value)
    setOpen(false)
    if (value === 'granted') loadGoogleAnalytics(id)
    // Turning analytics off after it loaded needs a reload to unload the script.
    else if (window.gtag) window.location.reload()
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-xl flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-sm shadow-lg sm:flex-row sm:items-center dark:border-neutral-800 dark:bg-neutral-950"
    >
      <p className="flex-1 text-neutral-600 dark:text-neutral-400">{site.analytics.consentText}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => choose('denied')}
          className="cursor-pointer rounded-md border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose('granted')}
          className="cursor-pointer rounded-md bg-accent px-3 py-1.5 font-medium text-white dark:text-neutral-950"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
