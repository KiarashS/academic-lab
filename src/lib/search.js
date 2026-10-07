// Site-wide search over the content already loaded in the page. Small labs have a few
// hundred items at most, so a simple scan is fast enough and needs no index file.
import site, { BUILT_IN_PAGES, navPages, pageEnabled, pagePath } from '../config/index.js'
import {
  awards,
  collaborators,
  customPageById,
  events,
  people,
  peopleNames,
  press,
  research,
  resources,
  sortedNews,
  sortedPublications,
  talks,
} from './data.js'

function strip(html = '') {
  return html.replace(/<[^>]+>/g, ' ')
}

function buildIndex() {
  const items = []
  // `subtitle` is the short line shown under the result; `text` is everything searched.
  const add = (type, title, url, subtitle, ...text) =>
    items.push({ type, title, url, subtitle, text: [subtitle, ...text].flat().filter(Boolean).join(' ') })

  for (const { page, label } of navPages) {
    const own = customPageById[page]
    if (own) add('Page', own.title || label, pagePath(page), own.intro, label, strip(own.html))
    else if (BUILT_IN_PAGES.includes(page)) add('Page', site[page]?.title || label, pagePath(page), null, label)
  }
  if (pageEnabled('people')) {
    for (const p of people)
      add('Person', p.name, `/people/${p.id}`, p.role || p.management, p.group, p.management, p.interests, p.excerpt)
  }
  if (pageEnabled('research')) {
    for (const r of research) add('Project', r.title, `/research/${r.id}`, r.summary, r.tags, strip(r.description))
  }
  if (pageEnabled('publications')) {
    for (const p of sortedPublications) {
      add(
        'Publication',
        p.title,
        site.publications.pages ? `/publications/${p.id}` : `/publications#${p.id}`,
        `${p.authors.join(', ')} · ${p.year}`,
        p.venue,
        p.tags,
        p.summary,
        p.abstract,
      )
    }
  }
  if (pageEnabled('news')) {
    for (const n of sortedNews)
      add('News', n.title || n.text, n.hasPage ? `/news/${n.id}` : '/news', n.date, n.text, strip(n.html))
  }
  if (pageEnabled('events')) {
    for (const e of events) {
      add(
        'Event',
        e.title,
        e.hasPage ? `/events/${e.id}` : '/events',
        [e.date, e.location].filter(Boolean).join(' · '),
        e.speaker,
        e.affiliation,
        e.summary,
      )
    }
  }
  if (pageEnabled('talks')) {
    for (const t of talks) {
      add(
        'Talk',
        t.title,
        '/talks',
        [peopleNames(t.speakers).join(', '), t.event].filter(Boolean).join(' · '),
        t.location,
        site.talks.types?.[t.type],
        t.abstract,
      )
    }
  }
  if (pageEnabled('press')) {
    for (const a of awards)
      add(
        'Award',
        a.title,
        '/press',
        [a.by, peopleNames(a.recipients).join(', ')].filter(Boolean).join(' · '),
        a.description,
      )
    for (const p of press) add('Press', p.title, '/press', p.outlet, peopleNames(p.people), p.summary)
  }
  if (pageEnabled('collaborators')) {
    for (const c of collaborators) {
      add(
        'Collaborator',
        c.institution || c.name,
        '/collaborators',
        [c.name, c.city, c.country].filter(Boolean).join(', '),
        c.department,
      )
    }
  }
  if (pageEnabled('resources')) {
    for (const r of resources)
      add(r.type === 'dataset' ? 'Dataset' : 'Software', r.title, '/resources', r.description, r.tags)
  }
  return items.map((item) => ({
    ...item,
    haystack: `${item.title} ${item.text}`.toLowerCase(),
    titleLower: item.title.toLowerCase(),
  }))
}

let index = null

export function search(query, limit = 20) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  index ||= buildIndex()
  return index
    .filter((item) => words.every((w) => item.haystack.includes(w)))
    .map((item) => {
      // Title matches rank first, then matches at the start of the title.
      let score = words.filter((w) => item.titleLower.includes(w)).length * 10
      if (item.titleLower.startsWith(words[0])) score += 5
      if (item.type === 'Page') score += 3
      return { ...item, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
