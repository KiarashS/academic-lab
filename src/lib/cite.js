// A plain-text citation in APA style: "Nair, P., Chen, S., & Rivera, A. (2026). Title. Venue."
function apaName(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name
  const last = parts.pop()
  const initials = parts.map((p) => `${p[0].toUpperCase()}.`).join(' ')
  return `${last}, ${initials}`
}

function joinAuthors(authors) {
  const names = authors.map(apaName)
  if (names.length === 1) return names[0]
  if (names.length > 20) return `${names.slice(0, 19).join(', ')}, … ${names.at(-1)}`
  return `${names.slice(0, -1).join(', ')}, & ${names.at(-1)}`
}

export function formatCitation(pub) {
  const parts = [`${joinAuthors(pub.authors)} (${pub.year}). ${pub.title.replace(/\.$/, '')}.`]
  let venue = pub.venue || ''
  if (pub.volume) venue += `, ${pub.volume}`
  if (pub.pages) venue += `, ${pub.pages.replace(/-+/, '–')}`
  if (venue) parts.push(`${venue}.`)
  if (pub.links?.doi) parts.push(pub.links.doi)
  return parts.join(' ')
}
