import { useEffect, useRef, useState } from 'react'
import { parseEmbed } from '../lib/embed.js'
import { asset } from '../lib/utils.js'
import Img from './Img.jsx'
import SmartLink from './SmartLink.jsx'

// A video file used like an animated image: silent, looping, playing only while on screen.
// Visitors who ask for reduced motion see the first frame (or the poster) with controls.
function LoopingVideo({ media, className }) {
  const ref = useRef(null)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStill(true)
      return
    }
    if (!('IntersectionObserver' in window)) {
      video.play().catch(() => {})
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={media.poster ? asset(media.src) : `${asset(media.src)}#t=0.1`}
      poster={asset(media.poster)}
      muted
      loop
      playsInline
      preload="metadata"
      controls={still}
      aria-label={media.alt || undefined}
      className={className}
    />
  )
}

// YouTube or Vimeo: a thumbnail with a play button; the player loads only when pressed.
function Embed({ media, title, className }) {
  const [playing, setPlaying] = useState(false)
  const embed = parseEmbed(media.src)
  const poster = media.poster ? asset(media.poster) : embed?.thumbnail
  if (playing && embed) {
    return (
      <iframe
        src={embed.player}
        title={title || 'Video'}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={`${className} border-0 bg-black`}
      />
    )
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video${title ? `: ${title}` : ''}`}
      className={`${className} group relative block cursor-pointer overflow-hidden bg-neutral-800`}
    >
      {poster && (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className="size-full object-cover"
        />
      )}
      <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors group-hover:bg-black/75">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="translate-x-px"
        >
          <path d="M7 4l13 8-13 8z" />
        </svg>
      </span>
    </button>
  )
}

// The image, GIF or video shown beside a publication or event (`media` in its content).
// `to` makes images and videos link to the item's page; `aspect` crops them to one shape
// (e.g. '16 / 10'), or null keeps each one's own shape.
export default function TeaserMedia({ media, title, to, aspect, sizes = '13rem', large = false, className = '' }) {
  if (!media?.src) return null
  const shape = aspect ? 'w-full object-cover' : 'w-full h-auto'
  const style = aspect ? { aspectRatio: aspect } : undefined
  const frame = `block overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900 ${className}`

  if (media.type === 'embed') {
    return (
      <div className={frame} style={{ aspectRatio: aspect || '16 / 9' }}>
        <Embed media={media} title={title} className="size-full" />
      </div>
    )
  }

  const inner =
    media.type === 'video' ? (
      <LoopingVideo media={media} className={`${shape} block`} />
    ) : (
      <Img
        src={media.src}
        sizes={sizes}
        alt={media.alt || ''}
        loading={large ? undefined : 'lazy'}
        className={`${shape} block`}
      />
    )
  const box = (
    <span className={frame} style={style}>
      {aspect ? <span className="block size-full [&>*]:size-full">{inner}</span> : inner}
    </span>
  )
  // The title already links to the page, so this extra link is skipped by keyboards and
  // screen readers. Videos with controls (reduced motion) stay unlinked so they work.
  return to && media.type === 'image' ? (
    <SmartLink to={to} tabIndex={-1} aria-hidden="true" className="block transition-opacity hover:opacity-90">
      {box}
    </SmartLink>
  ) : (
    box
  )
}

// Text with the item's media beside it from the md breakpoint up: to the right or left, as
// `config.position` says. On narrow screens the media goes below the text (or above it,
// for 'left'). `config` is publications.media or events.media from site.js.
export function WithMedia({ media, config, title, to, children }) {
  if (!media?.src || !config?.show) return children
  const left = config.position === 'left'
  const width = config.width || '13rem'
  return (
    <div
      style={{ '--media-w': width }}
      className={`flex gap-3 md:grid md:gap-6 ${left ? 'flex-col-reverse md:grid-cols-[var(--media-w)_minmax(0,1fr)]' : 'flex-col md:grid-cols-[minmax(0,1fr)_var(--media-w)]'}`}
    >
      <div className={`min-w-0 ${left ? 'md:order-2' : ''}`}>{children}</div>
      <TeaserMedia
        media={media}
        title={title}
        to={to}
        aspect={config.aspect}
        sizes={`(min-width: 768px) ${width}, 20rem`}
        className={`max-w-xs md:mt-1 md:max-w-none ${left ? 'md:order-1' : ''}`}
      />
    </div>
  )
}
