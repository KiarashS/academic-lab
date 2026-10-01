import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Authors from '../components/Authors.jsx'
import { CitationCount, LINK_LABELS } from '../components/PublicationItem.jsx'
import Tag from '../components/Tag.jsx'
import site, { pageEnabled } from '../config/index.js'
import { toBibtex } from '../lib/bibtex.js'
import { formatCitation } from '../lib/cite.js'
import { projectById, publicationById } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'

function CopyBlock({ label, text, mono = false }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied; the text is still selectable.
    }
  }
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm text-neutral-500 dark:text-neutral-400">{label}</h3>
        <button type="button" onClick={copy} className="cursor-pointer text-sm text-accent hover:underline pointer-coarse:px-2 pointer-coarse:py-1">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {mono ? (
        <pre className="overflow-x-auto rounded-md bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          {text}
        </pre>
      ) : (
        <p className="rounded-md bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          {text}
        </p>
      )}
    </div>
  )
}

export default function PublicationDetail() {
  const { id } = useParams()
  const pub = publicationById[id]
  useTitle(pub?.title)
  if (!pub || !site.publications.pages) return <NotFound />

  const links = Object.entries(pub.links || {}).filter(([, url]) => url)
  const projects = (pub.projects || []).map((p) => projectById[p]).filter(Boolean)
  const types = site.publications.types

  return (
    <article>
      <Link to="/publications" className="text-sm text-neutral-500 hover:text-accent dark:text-neutral-400">
        &larr; {site.publications.title}
      </Link>

      <header className="mt-6 max-w-3xl">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {[types[pub.type], pub.year].filter(Boolean).join(' · ')}
          {pub.award && <span className="ml-2 text-accent">{pub.award}</span>}
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {pub.title}
        </h1>
        <p className="mt-4 text-neutral-700 dark:text-neutral-300">
          <Authors authors={pub.authors} />
        </p>
        <p className="mt-1 text-neutral-500 italic dark:text-neutral-400">
          {pub.venue}
          {pub.volume && `, vol. ${pub.volume}`}
          {pub.pages && `, pp. ${pub.pages}`}
        </p>
      </header>

      {(links.length > 0 || pub.citations) && (
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 pointer-coarse:[&>*]:py-0.5">
          {links.map(([key, url]) => (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              {LINK_LABELS[key] || key}
            </a>
          ))}
          <CitationCount pub={pub} />
        </div>
      )}

      {pub.abstract && (
        <section className="mt-10 max-w-2xl">
          <h2 className="mb-3 text-sm font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Abstract
          </h2>
          <p className="leading-relaxed">{pub.abstract}</p>
        </section>
      )}

      <section className="mt-10 grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-6">
        <h2 className="text-sm font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">Cite</h2>
        <CopyBlock label="Text" text={formatCitation(pub)} />
        {site.publications.showBibtex && <CopyBlock label="BibTeX" text={toBibtex(pub)} mono />}
      </section>

      {(projects.length > 0 || pub.tags?.length > 0) && (
        <section className="mt-10 max-w-3xl space-y-4">
          {projects.length > 0 && (
            <p className="text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Part of </span>
              {projects.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ', '}
                  {pageEnabled('research') ? (
                    <Link to={`/research/${p.id}`} className="prose-link">
                      {p.title}
                    </Link>
                  ) : (
                    p.title
                  )}
                </span>
              ))}
            </p>
          )}
          {pub.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pub.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          )}
        </section>
      )}
    </article>
  )
}
