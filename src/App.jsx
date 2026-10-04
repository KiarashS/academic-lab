import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import { navPages } from './config/index.js'
import Collaborators from './pages/Collaborators.jsx'
import Contact from './pages/Contact.jsx'
import EventDetail from './pages/EventDetail.jsx'
import Events from './pages/Events.jsx'
import Gallery from './pages/Gallery.jsx'
import Home from './pages/Home.jsx'
import Join from './pages/Join.jsx'
import News from './pages/News.jsx'
import NewsPost from './pages/NewsPost.jsx'
import NotFound from './pages/NotFound.jsx'
import People from './pages/People.jsx'
import Press from './pages/Press.jsx'
import PersonDetail from './pages/PersonDetail.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import PublicationDetail from './pages/PublicationDetail.jsx'
import Publications from './pages/Publications.jsx'
import Research from './pages/Research.jsx'
import Resources from './pages/Resources.jsx'
import Talks from './pages/Talks.jsx'
import Teaching from './pages/Teaching.jsx'

// Every page the site knows about. Only pages listed in site.nav get routes
// (the home page always exists; its nav entry only adds a menu link).
// To add a page: create it in src/pages/, register it here, then add it to site.nav.
const PAGES = {
  research: { component: Research, detail: ProjectDetail },
  people: { component: People, detail: PersonDetail },
  publications: { component: Publications, detail: PublicationDetail },
  news: { component: News, detail: NewsPost },
  events: { component: Events, detail: EventDetail },
  talks: { component: Talks },
  press: { component: Press },
  collaborators: { component: Collaborators },
  resources: { component: Resources },
  gallery: { component: Gallery },
  teaching: { component: Teaching },
  join: { component: Join },
  contact: { component: Contact },
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {navPages.map(({ page }) => {
          const entry = PAGES[page]
          if (!entry) return null
          const { component: Page, detail: Detail } = entry
          return (
            <Route key={page} path={page}>
              <Route index element={<Page />} />
              {Detail && <Route path=":id" element={<Detail />} />}
            </Route>
          )
        })}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
