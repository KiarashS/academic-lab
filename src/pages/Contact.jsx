import PageHeader from '../components/PageHeader.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/index.js'
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
        <figcaption className="mt-2 flex gap-4 text-sm pointer-coarse:[&>*]:py-0.5">
          <SmartLink to={`https://www.google.com/maps/search/?api=1&query=${query}`}>Open in Google Maps</SmartLink>
          <SmartLink to={`https://www.google.com/maps/dir/?api=1&destination=${query}`}>Directions</SmartLink>
        </figcaption>
      )}
    </figure>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-sm text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}

export default function Contact() {
  const config = site.contact
  useTitle(config.title)
  const { email, phone, address, directions, map } = config

  const FIELDS = {
    email: () =>
      email && (
        <Field key="email" label="Email">
          <SmartLink to={`mailto:${email}`}>{email}</SmartLink>
        </Field>
      ),
    phone: () =>
      phone && (
        <Field key="phone" label="Phone">
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-accent">
            {phone}
          </a>
        </Field>
      ),
    address: () =>
      address?.length > 0 && (
        <Field key="address" label="Address">
          <address className="not-italic">
            {address.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </address>
        </Field>
      ),
    directions: () =>
      directions && (
        <Field key="directions" label="Getting here">
          <span className="leading-relaxed text-neutral-600 dark:text-neutral-400">{directions}</span>
        </Field>
      ),
  }

  const fields = config.sections.map((key) => FIELDS[key]?.()).filter(Boolean)
  const showMap = config.sections.includes('map') && map

  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      <div className={`grid gap-12 ${fields.length && showMap ? 'md:grid-cols-2' : ''}`}>
        {fields.length > 0 && <dl className="space-y-6">{fields}</dl>}
        {showMap && <ContactMap map={map} />}
      </div>
    </>
  )
}
