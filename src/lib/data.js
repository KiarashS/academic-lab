// Derived views over the content files, shared by several pages.
import content from 'virtual:content'

// Everything from the content/ folder, prepared at build time by scripts/content.js.
export const {
  people,
  research,
  publications,
  news,
  events,
  teaching,
  join,
  slides,
  gallery,
  resources,
  funders,
  homeBlocks,
  images,
} = content

export const sortedPublications = [...publications].sort(
  (a, b) => b.year - a.year || (b.month || 0) - (a.month || 0) || a.title.localeCompare(b.title),
)

export const sortedNews = [...news].sort((a, b) => b.date.localeCompare(a.date))
export const newsById = Object.fromEntries(news.map((n) => [n.id, n]))

// Events split around a day (YYYY-MM-DD). Multi-day events stay upcoming until their last
// day. Use with useToday() so pre-rendered pages and the browser agree.
export function splitEvents(today) {
  return {
    upcoming: events
      .filter((e) => (e.endDate || e.date) >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')),
    past: events.filter((e) => (e.endDate || e.date) < today).sort((a, b) => b.date.localeCompare(a.date)),
  }
}
export const eventById = Object.fromEntries(events.map((e) => [e.id, e]))

export const currentMembers = people.filter((p) => !p.alumni)
export const alumni = people.filter((p) => p.alumni)

export const personById = Object.fromEntries(people.map((p) => [p.id, p]))
export const projectById = Object.fromEntries(research.map((r) => [r.id, r]))
export const publicationById = Object.fromEntries(publications.map((p) => [p.id, p]))

// Map every name and alias of a lab member to their id.
const nameToId = new Map()
for (const person of people) {
  for (const name of [person.name, ...(person.aliases || [])]) {
    nameToId.set(normalizeName(name), person.id)
  }
}

// Compare names ignoring accents, periods and case: 'K. Müller' matches 'K Muller'.
export function normalizeName(name) {
  return name.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\./g, '').trim().toLowerCase()
}

export function memberIdForAuthor(author) {
  return nameToId.get(normalizeName(author)) || null
}

export function publicationsByPerson(personId) {
  return sortedPublications.filter((pub) => pub.authors.some((a) => memberIdForAuthor(a) === personId))
}

export function publicationsByProject(projectId) {
  return sortedPublications.filter((pub) => pub.projects?.includes(projectId))
}

export function projectsByPerson(personId) {
  return research.filter((r) => r.members?.includes(personId))
}
