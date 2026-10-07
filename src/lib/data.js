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
  talks,
  awards,
  press,
  collaborators,
  homeBlocks,
  pages,
  notices,
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

// Also the short forms Google Scholar and many BibTeX files use: "A Rivera" and, with a
// middle name, "AJ Rivera" or "A J Rivera". Written names and aliases above take
// precedence, and a short form two members share is left out rather than guessed.
const shortForms = new Map()
for (const person of people) {
  const parts = normalizeName(person.name).split(/\s+/)
  if (parts.length < 2) continue
  const last = parts.at(-1)
  const initials = parts.slice(0, -1).map((p) => p[0])
  const forms = new Set([`${initials[0]} ${last}`, `${initials.join('')} ${last}`, `${initials.join(' ')} ${last}`])
  for (const form of forms) shortForms.set(form, shortForms.has(form) ? null : person.id)
}
for (const [form, id] of shortForms) if (id && !nameToId.has(form)) nameToId.set(form, id)

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

// Talks, awards and press items list people by id (lab members) or by name (guests).
// Names for display, so author-style lists can link the members.
export function peopleNames(refs = []) {
  return refs.map((ref) => personById[ref]?.name || ref)
}

function includesPerson(refs = [], personId) {
  return refs.some((ref) => ref === personId || memberIdForAuthor(String(ref)) === personId)
}

export function talksByPerson(personId) {
  return talks.filter((t) => includesPerson(t.speakers, personId))
}

export function awardsByPerson(personId) {
  return awards.filter((a) => includesPerson(a.recipients, personId))
}

// Pages of your own from content/pages/, by file name.
export const customPageById = Object.fromEntries(pages.map((p) => [p.id, p]))

// A position is open while `open` is true and its `deadline` (if any) hasn't passed. With a
// deadline and no `open`, it is open until the deadline. Use with useToday().
export function positionOpen(position, today) {
  const open = position.open ?? Boolean(position.deadline)
  return Boolean(open) && (!position.deadline || position.deadline >= today)
}

export function openPositions(today) {
  return (join.openings || []).filter((o) => positionOpen(o, today))
}
