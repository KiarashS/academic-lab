import { Link, useParams } from 'react-router'
import Markdown from '../components/Markdown.jsx'
import Newsletter from '../components/Newsletter.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/index.js'
import { newsById } from '../lib/data.js'
import DateParts from '../components/DateParts.jsx'
import useTitle from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'
import Img from '../components/Img.jsx'

export default function NewsPost() {
  const { id } = useParams()
  const post = newsById[id]
  useTitle(post?.title || post?.text)
  if (!post?.hasPage) return <NotFound />

  return (
    <article>
      <Link to="/news" className="text-sm text-neutral-500 hover:text-accent dark:text-neutral-400">
        &larr; {site.news.title}
      </Link>
      <header className="mt-6 mb-8 max-w-2xl">
        <DateParts iso={post.date} className="text-sm text-neutral-500 dark:text-neutral-400" />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          {post.title || post.text}
        </h1>
        {post.title && post.text && <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">{post.text}</p>}
      </header>
      {post.image && (
        <Img src={post.image} sizes="(min-width: 768px) 42rem, 100vw" className="mb-8 w-full max-w-2xl rounded-md" />
      )}
      <Markdown html={post.html} />
      {post.link?.url && (
        <p className="mt-8">
          <SmartLink to={post.link.url}>{post.link.label || 'Link'}</SmartLink>
        </p>
      )}
      <Newsletter placement="post" className="mt-16 max-w-2xl" />
    </article>
  )
}
