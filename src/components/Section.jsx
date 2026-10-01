import { Link } from 'react-router'

// `flush` removes the top margin, for a section that starts the page.
export default function Section({ title, more, flush = false, children }) {
  return (
    <section className={flush ? '' : 'mt-16 first:mt-0'}>
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-neutral-200 pb-2 dark:border-neutral-800">
        <h2 className="text-sm font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">{title}</h2>
        {more && (
          <Link
            to={more.to}
            className="text-sm text-neutral-500 hover:text-accent pointer-coarse:py-0.5 dark:text-neutral-400"
          >
            {more.label} &rarr;
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
