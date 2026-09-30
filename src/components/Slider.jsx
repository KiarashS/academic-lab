import { useCallback, useEffect, useRef, useState } from 'react'
import { asset } from '../lib/utils.js'
import SmartLink from './SmartLink.jsx'

const POSITIONS = { top: 'object-top', center: 'object-center', bottom: 'object-bottom' }

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Media({ slide, active, loop, onEnded }) {
  const videoRef = useRef(null)
  const fit = `absolute inset-0 size-full object-cover ${POSITIONS[slide.position] || ''}`

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (active) {
      video.currentTime = 0
      video.play().catch(() => {}) // autoplay can be blocked; the poster stays up
    } else {
      video.pause()
    }
  }, [active])

  if (slide.type === 'video') {
    return (
      <video
        ref={videoRef}
        src={asset(slide.src)}
        poster={asset(slide.poster)}
        muted
        loop={loop}
        playsInline
        preload="metadata"
        onEnded={onEnded}
        className={fit}
      />
    )
  }
  if (slide.type === 'embed') {
    // Only load the player while its slide is showing.
    return active ? (
      <iframe
        src={slide.src}
        title={slide.title || 'Video'}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    ) : null
  }
  return <img src={asset(slide.src)} alt={slide.alt || ''} className={fit} />
}

function ArrowButton({ direction, onClick }) {
  const label = direction === 'prev' ? 'Previous slide' : 'Next slide'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 ${direction === 'prev' ? 'left-3' : 'right-3'} z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-black/50 pointer-coarse:opacity-100`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={direction === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
      </svg>
    </button>
  )
}

export default function Slider({ slides, autoplay = true, interval = 6000, aspectRatio = '21 / 9' }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => autoplay && !prefersReducedMotion())
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const touchX = useRef(null)
  const count = slides.length

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count])
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = () => go(index - 1)

  // Images advance on a timer. Videos advance when they end; embeds wait for the visitor.
  const current = slides[index]
  useEffect(() => {
    if (!playing || hovered || focused || count < 2 || current.type !== 'image') return
    const id = setTimeout(next, interval)
    return () => clearTimeout(id)
  }, [playing, hovered, focused, count, current, interval, next])

  if (!count) return null

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }

  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)()
    touchX.current = null
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
      style={{ '--slider-ratio': aspectRatio }}
      className="group relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100 sm:aspect-(--slider-ratio) dark:bg-neutral-900"
    >
      {slides.map((slide, i) => {
        const active = i === index
        return (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={!active}
            inert={!active}
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`}
          >
            <Media slide={slide} active={active} loop={count === 1} onEnded={() => playing && count > 1 && next()} />
            {(slide.title || slide.caption) && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pt-16 pb-5 text-white sm:px-8 sm:pb-7">
                {slide.title && (
                  <h2 className="text-lg font-medium sm:text-2xl">
                    {slide.link ? (
                      <SmartLink to={slide.link} className="pointer-events-auto hover:underline">
                        {slide.title}
                      </SmartLink>
                    ) : (
                      slide.title
                    )}
                  </h2>
                )}
                {slide.caption && <p className="mt-1 max-w-xl text-sm text-white/85 sm:text-base">{slide.caption}</p>}
              </div>
            )}
          </div>
        )
      })}

      {count > 1 && (
        <>
          <ArrowButton direction="prev" onClick={prev} />
          <ArrowButton direction="next" onClick={next} />
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`size-2 cursor-pointer rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
            {autoplay && (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                className="ml-1 cursor-pointer text-white/80 hover:text-white"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  {playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 4l13 8-13 8z" />}
                </svg>
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
