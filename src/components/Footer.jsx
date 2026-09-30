import site from '../config/site.js'
import LinkList from './LinkList.jsx'
import SmartLink from './SmartLink.jsx'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-24 border-t border-neutral-100 dark:border-neutral-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-neutral-400">
        <div>
          <p>{site.footer.text || `© ${year} ${site.name}`}</p>
          {site.institution && (
            <p className="mt-1">
              {site.institution.url ? (
                <SmartLink to={site.institution.url} className="hover:text-accent">
                  {site.institution.name}
                </SmartLink>
              ) : (
                site.institution.name
              )}
            </p>
          )}
        </div>
        <LinkList links={site.social} />
      </div>
    </footer>
  )
}
