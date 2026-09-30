import { Link } from 'react-router'
import { isExternal } from '../lib/utils.js'

// Router link for internal paths, plain anchor (new tab) for external URLs.
export default function SmartLink({ to, children, className = 'prose-link', ...rest }) {
  if (isExternal(to)) {
    const newTab = !to.startsWith('mailto:')
    return (
      <a
        href={to}
        className={className}
        {...(newTab && { target: '_blank', rel: 'noopener noreferrer' })}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className} {...rest}>
      {children}
    </Link>
  )
}
