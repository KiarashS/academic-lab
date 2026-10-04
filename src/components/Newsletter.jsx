import { useId } from 'react'
import site from '../config/index.js'

// Where the sign-up form sends the address, from site.newsletter. null when it's off.
export function newsletterForm() {
  const n = site.newsletter || {}
  if (n.provider === 'buttondown' && n.buttondown) {
    return {
      action: `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(n.buttondown)}`,
      field: 'email',
      hidden: { embed: '1' },
    }
  }
  if (n.provider === 'form' && n.action) return { action: n.action, field: n.emailField || 'email', hidden: {} }
  return null
}

// "Get our news by email" box. `placement` is where it is being shown (news, post,
// footer, home); it only appears where site.newsletter.placement allows, except on the
// home page, which uses home.sections instead.
export default function Newsletter({ placement, compact = false, className = '' }) {
  const id = useId()
  const n = site.newsletter
  const form = newsletterForm()
  if (!form || (placement !== 'home' && !n.placement?.includes(placement))) return null

  // The service's own confirmation page opens in a new tab, so the visitor stays here.
  const fields = (
    <form action={form.action} method="post" target="_blank" className="mt-3 flex max-w-md flex-wrap gap-2">
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        id={id}
        type="email"
        name={form.field}
        required
        autoComplete="email"
        placeholder="you@example.org"
        className="min-w-0 flex-1 basis-48 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-base placeholder:text-neutral-400 sm:text-sm dark:border-neutral-800 dark:bg-neutral-950"
      />
      {Object.entries(form.hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        className="cursor-pointer rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white dark:text-neutral-950"
      >
        {n.button}
      </button>
    </form>
  )

  if (compact) {
    return (
      <div className={className}>
        <p className="font-medium text-neutral-700 dark:text-neutral-300">{n.title}</p>
        {fields}
      </div>
    )
  }
  return (
    <aside aria-label={n.title} className={`rounded-lg bg-neutral-50 p-6 sm:p-8 dark:bg-neutral-900 ${className}`}>
      <h2 className="font-medium text-neutral-900 dark:text-neutral-100">{n.title}</h2>
      {n.text && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{n.text}</p>}
      {fields}
    </aside>
  )
}
