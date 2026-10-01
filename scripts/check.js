// `npm run check`: reads all content and reports problems without building the site.
// Exits with an error when there are problems, so it can run in CI.
import site from '../src/config/index.js'
import { loadContent } from './content.js'

process.env.STRICT_CONTENT = '1'
try {
  await loadContent(site)
  console.log('[content] No problems found.')
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
