const ENTRY_TYPES = {
  journal: 'article',
  conference: 'inproceedings',
  workshop: 'inproceedings',
  preprint: 'misc',
  book: 'incollection',
  thesis: 'phdthesis',
  other: 'misc',
}

const VENUE_FIELD = {
  article: 'journal',
  inproceedings: 'booktitle',
  incollection: 'booktitle',
  phdthesis: 'school',
  misc: 'howpublished',
}

export function toBibtex(pub) {
  if (pub.bibtex) return pub.bibtex.trim()

  const type = ENTRY_TYPES[pub.type] || 'misc'
  const doi = pub.links?.doi?.match(/10\.\d{4,}\/\S+/)?.[0]
  const fields = [
    ['title', `{${pub.title}}`],
    ['author', pub.authors.join(' and ')],
    [VENUE_FIELD[type], pub.venue],
    ['year', pub.year],
    ['volume', pub.volume],
    ['pages', pub.pages?.replace(/-+/, '--')],
    ['publisher', pub.publisher],
    ['doi', doi],
    ['url', pub.links?.pdf || pub.links?.arxiv],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '')

  const body = fields.map(([key, value]) => `  ${key} = {${value}}`).join(',\n')
  return `@${type}{${pub.id},\n${body}\n}`
}
