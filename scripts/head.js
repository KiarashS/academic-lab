// Everything that goes into a page's <head>, and the list of pages the site has.
import site, { navPages, pageEnabled } from '../src/config/index.js'
import { plainText } from './content.js'

export function escape(text = '') {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function truncate(text, max = 160) {
  if (!text || text.length <= max) return text
  return text.slice(0, text.lastIndexOf(' ', max - 1)) + '…'
}

export function absoluteUrl(path) {
  return site.url ? site.url.replace(/\/$/, '') + (path === '/' ? '/' : path) : null
}

function isAbsolute(url) {
  return /^https?:\/\//.test(url || '')
}

// Site paths (/uploads/x.jpg) as full URLs, for social previews and structured data.
function fullUrl(path) {
  if (!path) return undefined
  if (isAbsolute(path)) return path
  return absoluteUrl('/' + path.replace(/^\//, '')) || undefined
}

function analyticsTags() {
  const { plausible, umami, googleAnalytics, cookieConsent } = site.analytics || {}
  const tags = []
  if (plausible?.domain) {
    tags.push(`<script defer data-domain="${escape(plausible.domain)}" src="${escape(plausible.src)}"></script>`)
  }
  if (umami?.websiteId) {
    tags.push(`<script defer data-website-id="${escape(umami.websiteId)}" src="${escape(umami.src)}"></script>`)
  }
  // With cookie consent on, Google Analytics is loaded by the consent banner instead.
  if (googleAnalytics && !cookieConsent) {
    const id = escape(googleAnalytics)
    tags.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`,
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}')</script>`,
    )
  }
  return tags
}

// Google Scholar reads these "Highwire Press" tags to index a paper.
// https://scholar.google.com/intl/en/scholar/inclusion.html#indexing
function scholarTags(pub) {
  const tags = [['citation_title', pub.title]]
  for (const author of pub.authors) tags.push(['citation_author', author])
  const date = [pub.year, pub.month && String(pub.month).padStart(2, '0')].filter(Boolean).join('/')
  tags.push(['citation_publication_date', date])
  const venueTag = {
    journal: 'citation_journal_title',
    conference: 'citation_conference_title',
    workshop: 'citation_conference_title',
    thesis: 'citation_dissertation_institution',
    book: 'citation_inbook_title',
  }[pub.type]
  if (venueTag && pub.venue) tags.push([venueTag, pub.venue.replace(/^(PhD|Master's) thesis, /, '')])
  if (pub.volume) tags.push(['citation_volume', pub.volume])
  const [first, last] = String(pub.pages || '').split(/-+/)
  if (first) tags.push(['citation_firstpage', first])
  if (last) tags.push(['citation_lastpage', last])
  if (pub.publisher) tags.push(['citation_publisher', pub.publisher])
  const doi = pub.links?.doi?.match(/10\.\d{4,}\/\S+/)?.[0]
  if (doi) tags.push(['citation_doi', doi])
  if (pub.links?.pdf) tags.push(['citation_pdf_url', fullUrl(pub.links.pdf)])
  if (pub.abstract) tags.push(['citation_abstract', pub.abstract])
  return tags.map(([name, content]) => `<meta name="${name}" content="${escape(content)}" />`)
}

// schema.org structured data (JSON-LD), so search engines understand what a page is about.
function organization() {
  const { contact, institution } = site
  return {
    '@type': 'ResearchOrganization',
    name: site.name,
    description: site.description || undefined,
    url: site.url || undefined,
    logo: fullUrl(site.header.logo),
    email: contact.email || undefined,
    telephone: contact.phone || undefined,
    address: contact.address?.length ? contact.address.join(', ') : undefined,
    parentOrganization: institution?.name
      ? { '@type': 'Organization', name: institution.name, url: institution.url }
      : undefined,
    sameAs: (site.footer.social || []).map((s) => s.url).filter(isAbsolute),
  }
}

function personLd(p) {
  return {
    '@type': 'Person',
    name: p.name,
    jobTitle: p.role || undefined,
    email: p.email ? `mailto:${p.email}` : undefined,
    image: fullUrl(p.photo),
    url: absoluteUrl(`/people/${p.id}`) || undefined,
    affiliation: { '@type': 'ResearchOrganization', name: site.name, url: site.url || undefined },
    sameAs: [p.website, p.scholar, p.github, p.orcid, p.linkedin, p.twitter, p.bluesky].filter(isAbsolute),
    knowsAbout: p.interests?.length ? p.interests : undefined,
  }
}

function articleLd(pub) {
  const doi = pub.links?.doi?.match(/10\.\d{4,}\/\S+/)?.[0]
  return {
    '@type': 'ScholarlyArticle',
    headline: pub.title.slice(0, 110),
    name: pub.title,
    author: pub.authors.map((name) => ({ '@type': 'Person', name })),
    datePublished: [pub.year, pub.month && String(pub.month).padStart(2, '0')].filter(Boolean).join('-'),
    isPartOf: pub.venue ? { '@type': 'Periodical', name: pub.venue } : undefined,
    abstract: pub.abstract || undefined,
    url: absoluteUrl(`/publications/${pub.id}`) || undefined,
    sameAs: [pub.links?.doi, pub.links?.arxiv].filter(isAbsolute),
    identifier: doi ? { '@type': 'PropertyValue', propertyID: 'DOI', value: doi } : undefined,
  }
}

function eventLd(e) {
  const tz = site.events.timezone
  const start = e.time ? `${e.date}T${e.time}` : e.date
  const end = e.end ? `${e.endDate || e.date}T${e.end}` : e.endDate
  return {
    '@type': 'Event',
    name: e.title,
    description: e.summary || undefined,
    startDate: start,
    endDate: end || undefined,
    eventTimezone: e.time ? tz : undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    location: e.location ? { '@type': 'Place', name: e.location, address: e.location } : undefined,
    performer: e.speaker ? { '@type': 'Person', name: e.speaker, affiliation: e.affiliation || undefined } : undefined,
    organizer: { '@type': 'ResearchOrganization', name: site.name, url: site.url || undefined },
    url: e.hasPage ? absoluteUrl(`/events/${e.id}`) || undefined : e.link || undefined,
  }
}

function jsonLdTag(data) {
  if (!data) return null
  const json = JSON.stringify({ '@context': 'https://schema.org', ...data }, (k, v) =>
    v === undefined || (Array.isArray(v) && v.length === 0) ? undefined : v,
  )
  return `<script type="application/ld+json">${json.replace(/</g, '\\u003c')}</script>`
}

export function head({ title, description, path, base, image, jsonLd, meta = [], type = 'website' }) {
  const fullTitle = title ? `${title} | ${site.name}` : site.name
  const url = absoluteUrl(path)
  const desc = description || site.description
  const ogImage = fullUrl(image || site.ogImage)
  const { theme } = site
  const rss = pageEnabled('news') && site.news.rss && site.url

  const tags = [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(desc)}" />`,
    `<meta property="og:site_name" content="${escape(site.name)}" />`,
    `<meta property="og:title" content="${escape(fullTitle)}" />`,
    `<meta property="og:description" content="${escape(desc)}" />`,
    `<meta property="og:type" content="${type}" />`,
    url && `<meta property="og:url" content="${escape(url)}" />`,
    url && `<link rel="canonical" href="${escape(url)}" />`,
    ogImage && `<meta property="og:image" content="${escape(ogImage)}" />`,
    ogImage && `<meta property="og:image:width" content="1200" />`,
    ogImage && `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />`,
    `<link rel="icon" href="${base}${escape(site.favicon || 'favicon.svg')}" />`,
    rss && `<link rel="alternate" type="application/rss+xml" title="${escape(site.name)}" href="${base}news.xml" />`,
    ...meta,
    jsonLdTag(jsonLd),
    `<style>:root{--accent-light:${theme.accent};--accent-dark:${theme.accentDark || theme.accent};--font-body:${theme.font}}</style>`,
    // Apply the saved or default color mode before first paint to avoid a flash.
    `<script>try{var m=localStorage.getItem('color-mode')||${JSON.stringify(theme.defaultMode || 'system')};` +
      `if(m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}</script>`,
    ...analyticsTags(),
  ]
  return '<!--site-head-->\n    ' + tags.filter(Boolean).join('\n    ') + '\n    <!--/site-head-->'
}

// Every URL on the site with what its head needs. `og` is the text for its social image.
export function pageList(content) {
  const list = [
    {
      path: '/',
      description: site.description,
      og: { title: site.tagline || site.name, subtitle: site.description },
      jsonLd: { ...organization(), '@type': 'ResearchOrganization' },
    },
  ]
  for (const { page, label } of navPages) {
    if (page === 'home') continue
    const title = site[page]?.title || label
    list.push({ path: `/${page}`, title, description: site.description, og: { title, subtitle: site.name } })
  }

  if (pageEnabled('people')) {
    for (const p of content.people) {
      const summary = [p.name, p.role].filter(Boolean).join(', ')
      list.push({
        path: `/people/${p.id}`,
        title: p.name,
        description: truncate(p.excerpt ? `${summary}. ${p.excerpt}` : summary),
        og: { title: p.name, subtitle: [p.role, site.name].filter(Boolean).join(' · ') },
        type: 'profile',
        jsonLd: personLd(p),
      })
    }
  }
  if (pageEnabled('research')) {
    for (const r of content.research) {
      list.push({
        path: `/research/${r.id}`,
        title: r.title,
        description: truncate(r.excerpt),
        image: r.image,
        og: { title: r.title, subtitle: site.name },
      })
    }
  }
  if (pageEnabled('publications') && site.publications.pages) {
    for (const pub of content.publications) {
      list.push({
        path: `/publications/${pub.id}`,
        title: pub.title,
        description: truncate(pub.abstract || `${pub.authors.join(', ')}. ${pub.venue}, ${pub.year}.`),
        og: { title: pub.title, subtitle: [pub.authors.join(', '), pub.venue, pub.year].filter(Boolean).join(' · ') },
        type: 'article',
        meta: scholarTags(pub),
        jsonLd: articleLd(pub),
      })
    }
  }
  if (pageEnabled('news')) {
    for (const n of content.news.filter((n) => n.hasPage)) {
      list.push({
        path: `/news/${n.id}`,
        title: n.title || n.text,
        description: truncate(n.text || plainText(n.html)),
        image: n.image,
        og: { title: n.title || n.text, subtitle: site.name },
        type: 'article',
      })
    }
  }
  if (pageEnabled('events')) {
    const eventsPage = list.find((p) => p.path === '/events')
    if (eventsPage) eventsPage.jsonLd = { '@graph': content.events.map(eventLd) }
    for (const e of content.events.filter((e) => e.hasPage)) {
      list.push({
        path: `/events/${e.id}`,
        title: e.title,
        description: truncate(e.summary || e.title),
        og: { title: e.title, subtitle: [e.date, e.location].filter(Boolean).join(' · ') },
        jsonLd: eventLd(e),
      })
    }
  }
  return list
}
