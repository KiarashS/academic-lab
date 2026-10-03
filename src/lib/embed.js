// Turns a YouTube or Vimeo link in any of its usual forms (watch page, short link, embed
// URL) into a privacy-friendly player URL that starts playing, plus a thumbnail when the
// service has one at a predictable address. Other URLs are used as they are.
export function parseEmbed(src) {
  let url
  try {
    url = new URL(src)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m)\./, '')
  let id
  if (host === 'youtu.be') id = url.pathname.slice(1)
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
  }
  if (id) {
    return {
      provider: 'youtube',
      id,
      player: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    }
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    id = url.pathname.match(/(\d+)/)?.[1]
    if (id)
      return {
        provider: 'vimeo',
        id,
        player: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
      }
  }
  return { provider: null, player: src }
}
