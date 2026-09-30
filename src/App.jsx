import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import site from './config/site.js'
import Contact from './pages/Contact.jsx'
import Home from './pages/Home.jsx'
import Join from './pages/Join.jsx'
import News from './pages/News.jsx'
import NotFound from './pages/NotFound.jsx'
import People from './pages/People.jsx'
import PersonDetail from './pages/PersonDetail.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Publications from './pages/Publications.jsx'
import Research from './pages/Research.jsx'
import Teaching from './pages/Teaching.jsx'

// Every page the site knows about. Only pages listed in site.nav get routes.
// To add a page: create it in src/pages/, register it here, then add it to site.nav.
const PAGES = {
  research: { component: Research, detail: ProjectDetail },
  people: { component: People, detail: PersonDetail },
  publications: { component: Publications },
  news: { component: News },
  teaching: { component: Teaching },
  join: { component: Join },
  contact: { component: Contact },
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {site.nav.map(({ page }) => {
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
