export function personLinks(person) {
  return [
    { label: person.email || 'Email', url: person.email && `mailto:${person.email}` },
    { label: 'Website', url: person.website },
    { label: 'Scholar', url: person.scholar },
    { label: 'GitHub', url: person.github },
    { label: 'ORCID', url: person.orcid },
    { label: 'LinkedIn', url: person.linkedin },
    { label: 'X', url: person.twitter },
    { label: 'Bluesky', url: person.bluesky },
  ]
}
