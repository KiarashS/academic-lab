import Markdown from '../components/Markdown.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { customPageById } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'
import NotFound from './NotFound.jsx'

// A page of your own from content/pages/<id>.md: a title, an optional intro under it, and
// the Markdown text. `wide: true` in the front matter lets the text use the full width.
export default function MarkdownPage({ id }) {
  const page = customPageById[id]
  useTitle(page?.title)
  if (!page) return <NotFound />
  return (
    <>
      <PageHeader title={page.title} intro={page.intro} />
      <Markdown html={page.html} wide={page.wide} />
    </>
  )
}
