// Checks the content for mistakes that would otherwise fail silently: a typo in a person's
// id, a project that doesn't exist, a missing image. Problems are printed during every
// build and `npm run check`; with STRICT_CONTENT=1 (used on pull requests) they fail it.
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { imageKey, PUBLIC_DIR } from './images.js'

const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}$/
const TYPES = ['journal', 'conference', 'workshop', 'preprint', 'book', 'thesis', 'other']

export function validateContent(content, site) {
  const problems = []
  const add = (where, message) => problems.push(`${where}: ${message}`)

  const peopleIds = new Set(content.people.map((p) => p.id))
  const projectIds = new Set(content.research.map((r) => r.id))
  const groups = new Set(site.people.groups)

  const checkImage = (where, src) => {
    if (!src || /^(https?:)?\/\//.test(src) || src.startsWith('data:')) return
    if (!existsSync(join(PUBLIC_DIR, imageKey(src)))) add(where, `file not found: public/${imageKey(src)}`)
  }
  const checkDate = (where, field, value, required = true) => {
    if (!value) {
      if (required) add(where, `${field} is missing`)
    } else if (!DATE.test(value)) add(where, `${field} "${value}" should look like 2026-10-14`)
  }

  for (const p of content.people) {
    const where = `content/people/${p.id}.md`
    if (!p.name) add(where, 'name is missing')
    if (p.group && !groups.has(p.group) && !p.alumni) {
      add(where, `group "${p.group}" is not one of people.groups in src/config/site.js (${[...groups].join(', ')})`)
    }
    if (!p.group && !p.management && !p.alumni)
      add(where, 'has no group, management title or alumni flag, so it is not listed')
    checkImage(where, p.photo)
  }

  for (const r of content.research) {
    const where = `content/research/${r.id}.md`
    if (!r.title) add(where, 'title is missing')
    if (r.status && !['active', 'past'].includes(r.status)) add(where, `status "${r.status}" should be active or past`)
    for (const m of r.members || []) if (!peopleIds.has(m)) add(where, `member "${m}" has no file in content/people/`)
    checkImage(where, r.image)
  }

  const seenPubs = new Map()
  for (const pub of content.publications) {
    const where = `publication "${pub.id || pub.title}"`
    if (!pub.id) add(where, 'id is missing')
    else if (seenPubs.has(pub.id)) add(where, `id is used twice (also "${seenPubs.get(pub.id)}")`)
    else seenPubs.set(pub.id, pub.title)
    if (pub.id && !/^[A-Za-z0-9._:-]+$/.test(pub.id))
      add(where, 'id should use only letters, numbers, dots, dashes and underscores')
    if (!pub.title) add(where, 'title is missing')
    if (!pub.authors?.length) add(where, 'authors are missing')
    if (!pub.year) add(where, 'year is missing')
    if (pub.type && !TYPES.includes(pub.type)) add(where, `type "${pub.type}" should be one of ${TYPES.join(', ')}`)
    for (const id of pub.projects || [])
      if (!projectIds.has(id)) add(where, `project "${id}" has no file in content/research/`)
  }

  for (const n of content.news) {
    const where = `content/news/${n.id}.md`
    checkDate(where, 'date', n.date)
    if (!n.text && !n.title) add(where, 'needs text or a title')
    checkImage(where, n.image)
  }

  for (const e of content.events) {
    const where = `content/events/${e.id}.md`
    if (!e.title) add(where, 'title is missing')
    checkDate(where, 'date', e.date)
    checkDate(where, 'endDate', e.endDate, false)
    if (e.time && !TIME.test(e.time)) add(where, `time "${e.time}" should be 24-hour HH:MM, e.g. 15:00`)
    if (e.end && !TIME.test(e.end)) add(where, `end "${e.end}" should be 24-hour HH:MM, e.g. 16:00`)
    if (e.endDate && e.date && e.endDate < e.date) add(where, 'endDate is before date')
  }

  // A slide or gallery item: image, video file or YouTube/Vimeo link.
  const checkMedia = (where, m) => {
    if (m.type && !['image', 'video', 'embed'].includes(m.type)) add(where, `type "${m.type}" should be image, video or embed`)
    if (!m.src) add(where, 'src is missing')
    else if (m.type === 'embed') {
      if (!/^https?:\/\//.test(m.src)) add(where, `src "${m.src}" should be a YouTube or Vimeo link`)
    } else {
      checkImage(where, m.src)
      // GitHub refuses files over 100 MB, and a big video is slow for visitors anyway.
      const file = join(PUBLIC_DIR, imageKey(m.src))
      if (m.type === 'video' && !/^(https?:)?\/\//.test(m.src) && existsSync(file)) {
        const mb = statSync(file).size / 1e6
        if (mb > 50) add(where, `video is ${Math.round(mb)} MB; keep it under 50 MB (GitHub refuses files over 100 MB)`)
      }
    }
    checkImage(where, m.poster)
  }

  content.slides.forEach((s, i) => {
    const where = `content/slides.yml, slide ${i + 1}`
    checkMedia(where, s)
    if (s.duration != null && !(Number(s.duration) > 0)) add(where, `duration "${s.duration}" should be a number of milliseconds, e.g. 8000`)
  })
  for (const pub of content.publications) if (pub.media) checkMedia(`publication "${pub.id}", media`, pub.media)
  for (const e of content.events) if (e.media) checkMedia(`content/events/${e.id}.md, media`, e.media)
  for (const album of content.gallery) {
    album.photos.forEach((photo, i) => checkMedia(`content/gallery.yml, album "${album.title}", item ${i + 1}`, photo))
  }
  content.funders.forEach((f) => checkImage(`content/funders.yml, "${f.name}"`, f.logo))

  for (const n of content.notices) {
    const where = `content/notices.yml, notice "${n.id}"`
    if (!n.text) add(where, 'text is missing')
    checkDate(where, 'from', n.from, false)
    checkDate(where, 'until', n.until, false)
    if (n.from && n.until && n.until < n.from) add(where, 'until is before from')
    if (n.style && !['accent', 'info', 'success', 'warning'].includes(n.style)) {
      add(where, `style "${n.style}" should be accent, info, success or warning`)
    }
    if (n.placement && !['home', 'site'].includes(n.placement)) add(where, `placement "${n.placement}" should be home or site`)
  }

  // People in talks, awards and press: ids of lab members, or names for anyone else. A
  // lowercase-with-dashes value is meant as an id, so flag it when no such person exists.
  const checkPeople = (where, field, refs) => {
    if (refs != null && !Array.isArray(refs)) return add(where, `${field} should be a list`)
    for (const ref of refs || []) {
      if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(ref) && !peopleIds.has(ref)) add(where, `${field}: "${ref}" has no file in content/people/`)
    }
  }
  const LOOSE_DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/
  const talkTypes = Object.keys(site.talks?.types || {})
  content.talks.forEach((t, i) => {
    const where = `content/talks.yml, talk ${i + 1}${t.title ? ` "${t.title}"` : ''}`
    if (!t.title) add(where, 'title is missing')
    checkDate(where, 'date', t.date)
    if (t.type && !talkTypes.includes(t.type)) add(where, `type "${t.type}" should be one of ${talkTypes.join(', ')}`)
    checkPeople(where, 'speakers', t.speakers)
  })
  content.awards.forEach((a, i) => {
    const where = `content/press.yml, award ${i + 1}${a.title ? ` "${a.title}"` : ''}`
    if (!a.title) add(where, 'title is missing')
    if (!a.date) add(where, 'date is missing')
    else if (!LOOSE_DATE.test(a.date)) add(where, `date "${a.date}" should look like 2026, 2026-05 or 2026-05-01`)
    checkPeople(where, 'recipients', a.recipients)
  })
  content.press.forEach((p, i) => {
    const where = `content/press.yml, press item ${i + 1}${p.title ? ` "${p.title}"` : ''}`
    if (!p.title) add(where, 'title is missing')
    if (!p.date) add(where, 'date is missing')
    else if (!LOOSE_DATE.test(p.date)) add(where, `date "${p.date}" should look like 2026, 2026-05 or 2026-05-01`)
    checkPeople(where, 'people', p.people)
  })
  content.collaborators.forEach((c, i) => {
    const where = `content/collaborators.yml, item ${i + 1}${c.institution || c.name ? ` "${c.institution || c.name}"` : ''}`
    if (!c.institution && !c.name) add(where, 'needs an institution or a name')
    const hasLat = c.lat != null
    const hasLng = c.lng != null
    if (hasLat !== hasLng) add(where, 'needs both lat and lng for the map')
    if (hasLat && !(Number.isFinite(c.lat) && Math.abs(c.lat) <= 90)) add(where, `lat "${c.lat}" should be a number from -90 to 90`)
    if (hasLng && !(Number.isFinite(c.lng) && Math.abs(c.lng) <= 180)) add(where, `lng "${c.lng}" should be a number from -180 to 180`)
    for (const id of c.projects || []) if (!projectIds.has(id)) add(where, `project "${id}" has no file in content/research/`)
    checkImage(where, c.logo)
  })

  if (site.favicon) checkImage('favicon in src/config/site.js', site.favicon)
  checkImage('footer.credit.avatar in src/config/site.js', site.footer?.credit?.avatar)

  const blockIds = new Set(content.homeBlocks.map((b) => b.id))
  for (const b of content.homeBlocks) checkImage(`content/home/${b.id}.md`, b.image)
  for (const key of site.home.sections) {
    if (key.startsWith('block:') && !blockIds.has(key.slice(6))) {
      add('home.sections in src/config/site.js', `"${key}" has no file content/home/${key.slice(6)}.md`)
    }
  }

  return problems
}

export function reportProblems(problems) {
  if (!problems.length) return
  const strict = process.env.STRICT_CONTENT === '1'
  const header = `[content] ${problems.length} problem${problems.length > 1 ? 's' : ''} found:`
  const body = problems.map((p) => `  - ${p}`).join('\n')
  if (strict) throw new Error(`${header}\n${body}`)
  console.warn(`${header}\n${body}`)
}
