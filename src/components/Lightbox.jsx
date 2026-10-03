import { useEffect, useRef } from 'react'
import Img from './Img.jsx'

function Icon({ d }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

// Full-screen photo viewer. Arrow keys (or Home/End) move between photos, Escape or a
// click beside the photo closes it. On phones, swipe sideways to move and down to close.
export default function Lightbox({ photos, index, onChange, onClose }) {
  const dialog = useRef(null)
  const touch = useRef(null)
  const photo = photos[index]
  const count = photos.length
  const go = (i) => onChange((i + count) % count)
  const close = () => dialog.current?.close()

  // Open once, and keep the page behind from scrolling while open.
  useEffect(() => {
    const el = dialog.current
    if (!el.open) el.showModal()
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [])

  const onKeyDown = (e) => {
    const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: count - 1 }
    if (e.key in keys && count > 1) {
      e.preventDefault()
      go(keys[e.key])
    }
  }

  const onTouchStart = (e) => {
    touch.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null
  }
  const onTouchEnd = (e) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5 && count > 1) go(index + (dx < 0 ? 1 : -1))
    else if (dy > 80 && dy > Math.abs(dx) * 1.5) close()
  }

  const button =
    'absolute z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20'
  // The photos either side, loaded in the background so moving to them is instant.
  const neighbours = count > 1 ? [...new Set([(index + 1) % count, (index - 1 + count) % count])] : []

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onKeyDown={onKeyDown}
      // Anything but the photo, its caption and the buttons counts as "outside".
      onClick={(e) => !e.target.closest('img, figcaption, button') && close()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label="Photo viewer"
      className="m-0 size-full max-h-none max-w-none overscroll-contain bg-neutral-950 p-0 backdrop:bg-neutral-950"
    >
      <figure className="flex h-full flex-col items-center justify-center gap-3 px-4 pt-16 pb-24 sm:px-20 sm:py-14">
        {/* The photo's height leaves room for the padding and a line or two of caption. */}
        <Img
          key={photo.src}
          src={photo.src}
          sizes="100vw"
          alt={photo.alt || photo.caption || ''}
          className="max-h-[calc(100dvh-12rem)] max-w-full object-contain sm:max-h-[calc(100dvh-10rem)]"
        />
        <figcaption aria-live="polite" className="shrink-0 text-center text-sm text-white/80">
          {photo.caption}
          {count > 1 && (
            <span className="ml-2 text-white/50 tabular-nums">
              <span className="sr-only">Photo </span>
              {index + 1} / {count}
            </span>
          )}
        </figcaption>
      </figure>
      {neighbours.map((i) => (
        <Img key={i} src={photos[i].src} sizes="100vw" alt="" aria-hidden="true" className="hidden" />
      ))}
      <button type="button" onClick={close} aria-label="Close" className={`${button} top-4 right-4`}>
        <Icon d="M6 6l12 12M18 6L6 18" />
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className={`${button} bottom-6 left-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2`}
          >
            <Icon d="M15 18l-6-6 6-6" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className={`${button} right-4 bottom-6 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2`}
          >
            <Icon d="M9 18l6-6-6-6" />
          </button>
        </>
      )}
    </dialog>
  )
}
