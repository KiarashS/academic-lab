import { useState } from 'react'
import Lightbox from '../components/Lightbox.jsx'
import PageHeader from '../components/PageHeader.jsx'
import DateParts from '../components/DateParts.jsx'
import Section from '../components/Section.jsx'
import site from '../config/index.js'
import { gallery } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'
import Img from '../components/Img.jsx'
import { parseEmbed } from '../lib/embed.js'
import { asset } from '../lib/utils.js'

const THUMB =
  'aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none'

// The grid tile: the photo, or a video's poster. Without a poster, a video file shows its
// first frame and a YouTube video its thumbnail; anything else gets a plain dark tile.
function Thumb({ item }) {
  const sizes = '(min-width: 1024px) 15rem, (min-width: 640px) 33vw, 50vw'
  if (item.type === 'image' || item.poster) {
    return (
      <Img
        src={item.type === 'image' ? item.src : item.poster}
        sizes={sizes}
        alt={item.type === 'image' ? item.alt || item.caption || '' : ''}
        loading="lazy"
        className={THUMB}
      />
    )
  }
  if (item.type === 'video') {
    return (
      <video
        src={`${asset(item.src)}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className={THUMB}
      />
    )
  }
  const thumbnail = parseEmbed(item.src)?.thumbnail
  // A missing thumbnail leaves the dark tile instead of a broken image.
  return (
    <div className="aspect-[4/3] w-full bg-neutral-800">
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className={THUMB}
        />
      )}
    </div>
  )
}

export default function Gallery() {
  const config = site.gallery
  useTitle(config.title)
  const [open, setOpen] = useState(null) // { album, index }

  const albums = [...gallery].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      {albums.map((album, a) => (
        <Section key={album.title} title={album.title}>
          {(album.date || album.description) && (
            <p className="-mt-2 mb-5 text-sm text-neutral-500 dark:text-neutral-400">
              {album.date && <DateParts iso={album.date} />}
              {album.date && album.description && ' · '}
              {album.description}
            </p>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(album.photos || []).map((photo, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setOpen({ album: a, index: i })}
                  className="group relative block w-full cursor-zoom-in overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900"
                  aria-label={`${photo.type === 'image' ? 'Open photo' : 'Play video'}: ${photo.caption || photo.alt || `${i + 1} of ${album.photos.length}`}`}
                >
                  <Thumb item={photo} />
                  {photo.type !== 'image' && (
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
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Section>
      ))}
      {open && (
        <Lightbox
          photos={albums[open.album].photos}
          index={open.index}
          onChange={(index) => setOpen({ ...open, index })}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  )
}
