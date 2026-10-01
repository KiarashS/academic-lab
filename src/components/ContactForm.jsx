import { useState } from 'react'
import site from '../config/index.js'

// Sends the form through Formspree or Web3Forms (set in contact.form in site.js), which
// email the message to you. Renders nothing when no service is configured.
const inputClass =
  'w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-base placeholder:text-neutral-400 sm:text-sm dark:border-neutral-800'

function endpoint(form) {
  if (form.provider === 'formspree' && form.formspreeId) return `https://formspree.io/f/${form.formspreeId}`
  if (form.provider === 'web3forms' && form.web3formsKey) return 'https://api.web3forms.com/submit'
  return null
}

export default function ContactForm() {
  const form = site.contact.form
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const url = form && endpoint(form)
  if (!url) return null

  const onSubmit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    if (data.website) return // a bot filled in the hidden field
    delete data.website
    if (form.provider === 'web3forms') {
      data.access_key = form.web3formsKey
      data.subject = `Message from ${site.name} website`
    }
    setStatus('sending')
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p role="status" className="rounded-md bg-neutral-50 p-4 dark:bg-neutral-900">
        {form.success}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {form.title && <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{form.title}</h2>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-neutral-500 dark:text-neutral-400">Name</span>
          <input name="name" required autoComplete="name" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-neutral-500 dark:text-neutral-400">Email</span>
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm text-neutral-500 dark:text-neutral-400">Message</span>
        <textarea name="message" required rows={6} className={inputClass} />
      </label>
      {/* Hidden from people; bots that fill in every field give themselves away. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:text-neutral-950"
        >
          {status === 'sending' ? 'Sending…' : 'Send'}
        </button>
        {status === 'error' && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            The message could not be sent. Please try again, or email us directly.
          </p>
        )}
      </div>
    </form>
  )
}
