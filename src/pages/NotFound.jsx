import { Link } from 'react-router'
import useTitle from '../lib/useTitle.js'

export default function NotFound() {
  useTitle('Not found')
  return (
    <div className="py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Page not found</h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        The page you asked for does not exist.{' '}
        <Link to="/" className="prose-link">
          Go to the home page
        </Link>
        .
      </p>
    </div>
  )
}
