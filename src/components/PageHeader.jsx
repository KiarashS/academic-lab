import { paragraphs } from '../lib/utils.js'

export default function PageHeader({ title, intro, children }) {
  return (
    <header className="mb-12">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{title}</h1>
      {paragraphs(intro).map((p, i) => (
        <p key={i} className="mt-4 max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-400">
          {p}
        </p>
      ))}
      {children}
    </header>
  )
}
