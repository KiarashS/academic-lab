import { useCallback, useEffect, useState } from 'react'
import site from '../config/index.js'

const KEY = 'color-mode'
const MODES = ['system', 'light', 'dark']

function readMode() {
  try {
    const saved = localStorage.getItem(KEY)
    if (MODES.includes(saved)) return saved
  } catch {
    // Storage can be unavailable (private windows, blocked cookies).
  }
  return site.theme.defaultMode
}

function apply(mode) {
  const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function useColorMode() {
  // Start from the configured default so the pre-rendered page and the browser match,
  // then switch to the visitor's saved choice. The page colors themselves were already
  // set before first paint by the script in the page head.
  const [mode, setMode] = useState(site.theme.defaultMode)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setMode(readMode())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    apply(mode)
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode, loaded])

  const cycle = useCallback(() => {
    setMode((current) => {
      const next = MODES[(MODES.indexOf(current) + 1) % MODES.length]
      try {
        localStorage.setItem(KEY, next)
      } catch {
        // Ignore; the mode still applies for this visit.
      }
      return next
    })
  }, [])

  return [mode, cycle]
}
