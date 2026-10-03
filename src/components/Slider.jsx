import { useCallback, useEffect, useRef, useState } from 'react'
import { useHydrated } from '../lib/hydration.js'
import { parseEmbed } from '../lib/embed.js'
import { asset } from '../lib/utils.js'
import SmartLink from './SmartLink.jsx'
import Img from './Img.jsx'

const POSITIONS = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
}
// With more slides than this, a "3 / 12" counter replaces the dots.
const MAX_DOTS = 8

function Icon({ d, size = 18, fill = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  prev: 'M15 18l-6-6 6-6',
  next: 'M9 18l6-6-6-6',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  play: 'M7 4l13 8-13 8z',
  muted: 'M11 5L6 9H2v6h4l5 4zM23 9l-6 6M17 9l6 6',
  sound: 'M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14',
}

function Video({ slide, active, moving, muted, loop, onEnded, className }) {
  const ref = useRef(null)

  // Start from the beginning each time the slide comes back.
  useEffect(() => {
    if (active && ref.current) ref.current.currentTime = 0
  }, [active])

  // Play only while the slide shows and the slideshow isn't paused, off screen or in a
  // background tab. Paused, the video keeps its current frame (or the poster).
  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (active && moving)
      video.play().catch(() => {}) // autoplay can be blocked
    else video.pause()
  }, [active, moving])

  return (
    <video
      ref={ref}
      src={asset(slide.src)}
      poster={asset(slide.poster)}
      muted={muted}
      loop={loop}
      playsInline
      preload={active ? 'auto' : 'metadata'}
      onEnded={onEnded}
      aria-label={slide.alt || undefined}
      className={className}
    />
  )
}

// YouTube, Vimeo or another player. Until the visitor presses play, only a poster shows,
// so nothing loads from the video service on page load.
function Embed({ slide, active, started, onStart, className }) {
  const embed = parseEmbed(slide.src)
  const poster = slide.poster ? asset(slide.poster) : embed?.thumbnail
  if (active && started && embed) {
    return (
      <iframe
        src={embed.player}
        title={slide.title || slide.alt || 'Video'}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 z-[2] size-full border-0 bg-black"
      />
    )
  }
  return (
    <>
      <div className="absolute inset-0 bg-neutral-800" />
      {poster && (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          // A missing thumbnail leaves the dark background instead of a broken image.
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className={className}
        />
      )}
      <button
        type="button"
        onClick={onStart}
        aria-label={`Play video${slide.title ? `: ${slide.title}` : ''}`}
        className="absolute top-1/2 left-1/2 z-[2] flex size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
      >
        <span className="translate-x-0.5">
          <Icon d={ICONS.play} size={26} fill />
        </span>
      </button>
    </>
  )
}

function ArrowButton({ direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
      className={`absolute top-1/2 ${direction === 'prev' ? 'left-3' : 'right-3'} z-10 hidden size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-black/50 sm:flex pointer-coarse:opacity-100`}
    >
      <Icon d={ICONS[direction]} />
    </button>
  )
}

// Cyclic distance between two slide numbers.
function distance(a, b, count) {
  const d = Math.abs(a - b) % count
  return Math.min(d, count - d)
}

export default function Slider({
  slides,
  autoplay = true,
  interval = 6000,
  aspectRatio = '21 / 9',
  mobileAspectRatio = '4 / 3',
  progress = true,
}) {
  const hydrated = useHydrated()
  const count = slides.length
  const [index, setIndex] = useState(0)
  // Whether anything moves: the timer (when autoplay is on) and videos. The pause button
  // turns it off, and so does the visitor's reduced-motion setting.
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [onScreen, setOnScreen] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)
  const [muted, setMuted] = useState(true)
  const [started, setStarted] = useState(null) // the embed slide the visitor pressed play on
  // Slides whose media has been loaded: the current one and its neighbours, so the next
  // image is ready before it fades in but a long slideshow doesn't load everything at once.
  const [loaded, setLoaded] = useState(() => new Set([0, 1, count - 1]))
  const ref = useRef(null)
  const touch = useRef(null)

  // Checked after the first render so the pre-rendered page and the browser match.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    observer.observe(el)
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    setLoaded((prev) => {
      const near = [index, (index + 1) % count, (index - 1 + count) % count]
      return near.every((i) => prev.has(i)) ? prev : new Set([...prev, ...near])
    })
  }, [index, count])

  const go = useCallback(
    (i) => {
      setIndex(((i % count) + count) % count)
      setStarted(null)
    },
    [count],
  )
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = () => go(index - 1)

  if (!count) return null

  const current = slides[index]
  const isVideo = current.type === 'video'
  const embedPlaying = current.type === 'embed' && started === index
  // Videos (and embeds once started) decide when to move on; everything else uses the timer.
  const timed = autoplay && playing && count > 1 && !isVideo && !embedPlaying
  // Any motion stops while the slider is off screen or the tab is in the background.
  const visible = onScreen && tabVisible
  const timerRunning = timed && visible && !hovered && !keyboardFocus
  const hasMotion = autoplay || slides.some((s) => s.type === 'video')

  const onKeyDown = (e) => {
    const keys = {
      ArrowLeft: prev,
      ArrowRight: next,
      Home: () => go(0),
      End: () => go(count - 1),
    }
    if (keys[e.key] && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) {
      e.preventDefault()
      keys[e.key]()
    }
  }

  // A swipe has to be mostly sideways, so scrolling the page past the slider doesn't
  // change the slide.
  const onTouchStart = (e) => {
    touch.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null
  }
  const onTouchEnd = (e) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)()
  }

  const fit = (slide) => `absolute inset-0 size-full object-cover ${POSITIONS[slide.position] || ''}`
  const duration = Number(current.duration) || interval

  return (
    <section
      ref={ref}
      aria-roledescription="carousel"
      aria-label="Highlights"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Only keyboard focus pauses the slideshow; clicking an arrow or a dot should not
      // stop it for good.
      onFocus={(e) => setKeyboardFocus(e.target.matches(':focus-visible'))}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setKeyboardFocus(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        '--slider-ratio': aspectRatio,
        '--slider-mobile-ratio': mobileAspectRatio,
      }}
      className="group relative aspect-(--slider-mobile-ratio) overflow-hidden rounded-md bg-neutral-100 sm:aspect-(--slider-ratio) dark:bg-neutral-900"
    >
      {/* Screen readers hear the new slide when someone changes it, not on every timed change. */}
      <div aria-live={timed ? 'off' : 'polite'} className="absolute inset-0">
        {slides.map((slide, i) => {
          const active = i === index
          const label = slide.title || slide.alt || slide.caption
          return (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}${label ? `: ${label}` : ''}`}
              aria-hidden={!active}
              inert={!active}
              className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`}
            >
              {(loaded.has(i) || distance(i, index, count) <= 1) &&
                (slide.type === 'video' ? (
                  <Video
                    slide={slide}
                    active={active}
                    moving={playing && visible}
                    muted={muted}
                    loop={count === 1 || !autoplay}
                    onEnded={() => autoplay && playing && count > 1 && next()}
                    className={fit(slide)}
                  />
                ) : slide.type === 'embed' ? (
                  <Embed
                    slide={slide}
                    active={active}
                    started={started === i}
                    onStart={() => setStarted(i)}
                    className={fit(slide)}
                  />
                ) : (
                  <Img
                    src={slide.src}
                    sizes="(min-width: 1024px) 64rem, 100vw"
                    alt={slide.alt || ''}
                    fetchPriority={i === 0 ? 'high' : undefined}
                    className={fit(slide)}
                  />
                ))}

              {/* The whole slide is clickable when it has a link. Keyboard and screen reader
                  users get the title link instead, or this one when there is no title. */}
              {slide.link && (
                <SmartLink
                  to={slide.link}
                  className="absolute inset-0 z-[1]"
                  {...(slide.title ? { tabIndex: -1, 'aria-hidden': true } : { 'aria-label': label || 'Open' })}
                />
              )}

              {(slide.title || slide.caption) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/60 to-transparent px-5 pt-16 pb-5 text-white sm:px-8 sm:pb-7">
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
      </div>

      {/* The timer is this bar's animation: it pauses and resumes exactly where it was, and
          moving on when it ends keeps the bar and the slide change in step. */}
      {hydrated && timed && (
        <div
          key={index}
          onAnimationEnd={next}
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: timerRunning ? 'running' : 'paused',
          }}
          className={`slider-progress pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 origin-left bg-white/80 ${progress ? '' : 'opacity-0'}`}
        />
      )}

      {count > 1 && (
        <>
          {/* On phones the arrows would cover the caption; swiping does the same job there. */}
          <ArrowButton direction="prev" onClick={prev} />
          <ArrowButton direction="next" onClick={next} />
        </>
      )}

      {(count > 1 || isVideo) && (
        <div className="absolute top-2 right-2 z-10 flex items-center rounded-full bg-black/30 px-1 text-white sm:top-3 sm:right-3">
          {count > MAX_DOTS ? (
            <span className="px-2 text-xs tabular-nums" aria-live="off">
              {index + 1} / {count}
            </span>
          ) : (
            count > 1 &&
            slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index || undefined}
                className="group/dot flex size-6 cursor-pointer items-center justify-center"
              >
                <span
                  className={`size-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40 group-hover/dot:bg-white/70'}`}
                />
              </button>
            ))
          )}
          {isVideo && current.sound && (
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
              className="flex size-6 cursor-pointer items-center justify-center text-white/80 hover:text-white"
            >
              <Icon d={muted ? ICONS.muted : ICONS.sound} size={14} />
            </button>
          )}
          {hasMotion && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={`${playing ? 'Pause' : 'Play'} ${autoplay ? 'slideshow' : 'video'}`}
              className="flex size-6 cursor-pointer items-center justify-center text-white/80 hover:text-white"
            >
              <Icon d={playing ? ICONS.pause : ICONS.play} size={12} fill />
            </button>
          )}
        </div>
      )}
    </section>
  )
}
