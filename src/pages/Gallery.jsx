import { useState } from 'react'
import Lightbox from '../components/Lightbox.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import site from '../config/index.js'
import { gallery } from '../lib/data.js'
import { formatDate } from '../lib/utils.js'
import useTitle from '../lib/useTitle.js'
import Img from '../components/Img.jsx'

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
              {[album.date && formatDate(album.date), album.description].filter(Boolean).join(' · ')}
            </p>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(album.photos || []).map((photo, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setOpen({ album: a, index: i })}
                  className="group block w-full cursor-zoom-in overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900"
                  aria-label={`Open photo: ${photo.caption || `${i + 1} of ${album.photos.length}`}`}
                >
                  <Img
                    src={photo.src}
                    sizes="(min-width: 1024px) 15rem, (min-width: 640px) 33vw, 50vw"
                    alt={photo.alt || photo.caption || ''}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
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
