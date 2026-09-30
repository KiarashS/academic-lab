import { useEffect, useRef } from 'react'
import { asset } from '../lib/utils.js'

// Full-screen photo viewer. Arrow keys move between photos, Escape closes.
export default function Lightbox({ photos, index, onChange, onClose }) {
  const dialog = useRef(null)
  const touchX = useRef(null)
  const photo = photos[index]
  const count = photos.length

  useEffect(() => {
    const el = dialog.current
    if (!el.open) el.showModal()
    const onKey = (e) => {
      if (e.key === 'ArrowRight') onChange((index + 1) % count)
      if (e.key === 'ArrowLeft') onChange((index - 1 + count) % count)
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [index, count, onChange])

  const button =
    'absolute z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20'

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) onChange((index + (dx < 0 ? 1 : -1) + count) % count)
        touchX.current = null
      }}
      aria-label="Photo viewer"
      className="m-0 size-full max-h-none max-w-none bg-black/95 p-0 backdrop:bg-black/80"
    >
      <figure className="flex h-full flex-col items-center justify-center gap-3 p-4 sm:p-12">
        <img
          src={asset(photo.src)}
          alt={photo.alt || photo.caption || ''}
          className="max-h-[80vh] max-w-full object-contain"
        />
        <figcaption className="text-center text-sm text-white/80">
          {photo.caption}
          {count > 1 && (
            <span className="ml-2 text-white/50 tabular-nums">
              {index + 1} / {count}
            </span>
          )}
        </figcaption>
      </figure>
      <button
        type="button"
        onClick={() => dialog.current.close()}
        aria-label="Close"
        className={`${button} top-4 right-4`}
      >
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
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange((index - 1 + count) % count)}
            aria-label="Previous photo"
            className={`${button} bottom-6 left-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2`}
          >
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
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onChange((index + 1) % count)}
            aria-label="Next photo"
            className={`${button} right-4 bottom-6 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2`}
          >
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
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </dialog>
  )
}
