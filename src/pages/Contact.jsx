import PageHeader from '../components/PageHeader.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/site.js'
import useTitle from '../lib/useTitle.js'

// Map embeds centered on a point, with a pin. Neither needs an API key.
function pointEmbedUrl({ lat, lng, zoom = 16, provider }) {
  if (provider === 'openstreetmap') {
    // OpenStreetMap takes a bounding box, sized here from the zoom level.
    const span = 360 / 2 ** zoom
    const bbox = [lng - span, lat - span / 2, lng + span, lat + span / 2].join(',')
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
  }
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
}

function ContactMap({ map }) {
  const hasPoint = Number.isFinite(map.lat) && Number.isFinite(map.lng)
  const src = map.embedUrl || (hasPoint ? pointEmbedUrl(map) : null)
  if (!src) return null
  const query = hasPoint ? `${map.lat},${map.lng}` : null

  return (
    <figure>
      <iframe
        title="Map"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full rounded-md border border-neutral-200 dark:border-neutral-800"
      />
      {map.showLinks !== false && query && (
        <figcaption className="mt-2 flex gap-4 text-sm">
          <SmartLink to={`https://www.google.com/maps/search/?api=1&query=${query}`}>Open in Google Maps</SmartLink>
          <SmartLink to={`https://www.google.com/maps/dir/?api=1&destination=${query}`}>Directions</SmartLink>
        </figcaption>
      )}
    </figure>
  )
}

export default function Contact() {
  useTitle('Contact')
  const { email, phone, address, map, directions } = site.contact

  return (
    <>
      <PageHeader title="Contact" />
      <div className="grid gap-12 md:grid-cols-2">
        <dl className="space-y-6">
          {email && (
            <div>
              <dt className="text-sm text-neutral-500">Email</dt>
              <dd className="mt-1">
                <SmartLink to={`mailto:${email}`}>{email}</SmartLink>
              </dd>
            </div>
          )}
          {phone && (
            <div>
              <dt className="text-sm text-neutral-500">Phone</dt>
              <dd className="mt-1">
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-accent">
                  {phone}
                </a>
              </dd>
            </div>
          )}
          {address?.length > 0 && (
            <div>
              <dt className="text-sm text-neutral-500">Address</dt>
              <dd className="mt-1">
                <address className="not-italic">
                  {address.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </address>
              </dd>
            </div>
          )}
          {directions && (
            <div>
              <dt className="text-sm text-neutral-500">Getting here</dt>
              <dd className="mt-1 leading-relaxed text-neutral-600 dark:text-neutral-400">{directions}</dd>
            </div>
          )}
        </dl>
        {map && <ContactMap map={map} />}
      </div>
    </>
  )
}
