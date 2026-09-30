import { Fragment } from 'react'
import { Link } from 'react-router'
import site, { pageEnabled } from '../config/index.js'
import { memberIdForAuthor } from '../lib/data.js'

export default function Authors({ authors }) {
  return (
    <>
      {authors.map((author, i) => {
        const id = site.people.highlightInAuthorLists ? memberIdForAuthor(author) : null
        const sep = i === 0 ? '' : i === authors.length - 1 ? (authors.length > 2 ? ', and ' : ' and ') : ', '
        return (
          <Fragment key={i}>
            {sep}
            {id && !pageEnabled('people') ? (
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{author}</span>
            ) : id ? (
              <Link to={`/people/${id}`} className="font-medium text-neutral-800 hover:text-accent dark:text-neutral-200">
                {author}
              </Link>
            ) : (
              author
            )}
          </Fragment>
        )
      })}
    </>
  )
}
