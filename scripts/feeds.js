// RSS feed for news and iCalendar files for events, written at build time.

function xmlEscape(text = '') {
  return String(text).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c],
  )
}

export function newsRss({ site, news, absolute }) {
  const items = [...news]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50)
    .map((n) => {
      const link = absolute(n.hasPage ? `/news/${n.id}` : '/news')
      const description = n.html || `<p>${xmlEscape(n.text)}</p>`
      return [
        '    <item>',
        `      <title>${xmlEscape(n.title || n.text)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="false">${xmlEscape(absolute(`/news/${n.id}`))}</guid>`,
        `      <pubDate>${new Date(n.date + 'T12:00:00Z').toUTCString()}</pubDate>`,
        `      <description><![CDATA[${description.replace(/]]>/g, ']]]]><![CDATA[>')}]]></description>`,
        '    </item>',
      ].join('\n')
    })
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${site.name}: ${site.news.title}`)}</title>
    <link>${xmlEscape(absolute('/news'))}</link>
    <atom:link href="${xmlEscape(absolute('/news.xml'))}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(site.description)}</description>
    <language>${xmlEscape(site.locale)}</language>
${items.join('\n')}
  </channel>
</rss>
`
}

// Offset of a time zone from UTC at a given instant, in milliseconds.
function zoneOffset(utcMs, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(utcMs))
      .map((p) => [p.type, p.value]),
  )
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return asUtc - utcMs
}

// "2026-10-14" + "15:00" in "Asia/Tehran" -> Date in UTC
function zonedTime(date, time, timeZone) {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const first = guess - zoneOffset(guess, timeZone)
  return new Date(guess - zoneOffset(first, timeZone))
}

const icsStamp = (date) =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
const icsDay = (date) => date.replace(/-/g, '')

function nextDay(date) {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function icsText(text = '') {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/[,;]/g, (c) => '\\' + c)
}

// Lines longer than 75 octets must be folded.
function fold(line) {
  const out = []
  let rest = line
  while (rest.length > 74) {
    out.push(rest.slice(0, 74))
    rest = ' ' + rest.slice(74)
  }
  out.push(rest)
  return out.join('\r\n')
}

function vevent(event, { site, absolute, host }) {
  const timeZone = site.events.timezone || 'UTC'
  const lines = ['BEGIN:VEVENT', `UID:${event.id}@${host}`, `DTSTAMP:${icsStamp(new Date())}`]
  if (event.time) {
    const start = zonedTime(event.date, event.time, timeZone)
    const end = event.end
      ? zonedTime(event.endDate || event.date, event.end, timeZone)
      : new Date(start.getTime() + 60 * 60 * 1000)
    lines.push(`DTSTART:${icsStamp(start)}`, `DTEND:${icsStamp(end)}`)
  } else {
    lines.push(
      `DTSTART;VALUE=DATE:${icsDay(event.date)}`,
      `DTEND;VALUE=DATE:${icsDay(nextDay(event.endDate || event.date))}`,
    )
  }
  const description = [
    event.speaker && `${event.speaker}${event.affiliation ? `, ${event.affiliation}` : ''}`,
    event.summary,
  ]
    .filter(Boolean)
    .join('\n')
  lines.push(`SUMMARY:${icsText(event.title)}`)
  if (description) lines.push(`DESCRIPTION:${icsText(description)}`)
  if (event.location) lines.push(`LOCATION:${icsText(event.location)}`)
  const url = event.hasPage ? absolute(`/events/${event.id}`) : event.link
  if (url) lines.push(`URL:${url}`)
  lines.push('END:VEVENT')
  return lines
}

export function eventsIcs({ site, events, absolute, host }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${icsText(site.name)}//Events//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsText(`${site.name} ${site.events.title}`)}`,
    ...events.flatMap((e) => vevent(e, { site, absolute, host })),
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
