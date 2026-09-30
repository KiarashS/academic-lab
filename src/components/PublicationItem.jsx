import { useState } from 'react'
import site from '../config/index.js'
import { toBibtex } from '../lib/bibtex.js'
import Authors from './Authors.jsx'

const LINK_LABELS = {
  pdf: 'PDF',
  arxiv: 'arXiv',
  doi: 'DOI',
  code: 'Code',
  data: 'Data',
  project: 'Project',
  slides: 'Slides',
  poster: 'Poster',
  video: 'Video',
}

const buttonClass = 'cursor-pointer text-neutral-500 hover:text-accent dark:text-neutral-400 aria-expanded:text-accent'

export default function PublicationItem({ pub, showYear = true }) {
  const [open, setOpen] = useState(null) // 'abstract' | 'bibtex' | null
  const [copied, setCopied] = useState(false)
  const bibtex = site.publications.showBibtex ? toBibtex(pub) : null

  const toggle = (panel) => setOpen((current) => (current === panel ? null : panel))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied; the text is still selectable.
    }
  }

  const links = Object.entries(pub.links || {}).filter(([, url]) => url)

  return (
    <article id={pub.id} className="scroll-mt-8 rounded-md target:bg-accent/5 target:ring-8 target:ring-accent/5">
      <h3 className="leading-snug font-medium text-neutral-900 dark:text-neutral-100">
        {pub.title}
        {pub.award && (
          <span className="ml-2 align-middle text-xs font-normal whitespace-nowrap text-accent">{pub.award}</span>
        )}
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        <Authors authors={pub.authors} />
      </p>
      <p className="mt-0.5 text-sm text-neutral-500 italic dark:text-neutral-400">
        {pub.venue}
        {pub.volume && `, vol. ${pub.volume}`}
        {pub.pages && `, pp. ${pub.pages}`}
        {showYear && `, ${pub.year}`}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {links.map(([key, url]) => (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            {LINK_LABELS[key] || key}
          </a>
        ))}
        {pub.abstract && site.publications.showAbstract && (
          <button
            type="button"
            className={buttonClass}
            aria-expanded={open === 'abstract'}
            onClick={() => toggle('abstract')}
          >
            Abstract
          </button>
        )}
        {bibtex && (
          <button
            type="button"
            className={buttonClass}
            aria-expanded={open === 'bibtex'}
            onClick={() => toggle('bibtex')}
          >
            BibTeX
          </button>
        )}
      </div>

      {open === 'abstract' && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{pub.abstract}</p>
      )}
      {open === 'bibtex' && (
        <div className="relative mt-3">
          <pre className="overflow-x-auto rounded-md bg-neutral-50 p-4 pr-16 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
            {bibtex}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="absolute top-2 right-2 cursor-pointer rounded px-2 py-1 text-xs text-neutral-500 hover:text-accent"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </article>
  )
}
