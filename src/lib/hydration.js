import { useSyncExternalStore } from 'react'

// Pages are pre-rendered to HTML at build time and then "hydrated" in the browser. During
// hydration the app must render exactly what the build rendered, so anything that depends
// on the visitor (saved settings, today's date, the URL's ?query) waits for this to be true.
const subscribe = () => () => {}

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

// The day the site was built (YYYY-MM-DD), set by scripts/site-plugin.js.
// eslint-disable-next-line no-undef
export const BUILD_DATE = typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : new Date().toISOString().slice(0, 10)

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Today in the visitor's time zone once hydrated; the build date before that.
export function useToday() {
  return useHydrated() ? todayIso() : BUILD_DATE
}
