import PageHeader from '../components/PageHeader.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site from '../config/site.js'
import useTitle from '../lib/useTitle.js'

export default function Contact() {
  useTitle('Contact')
  const { email, phone, address, mapEmbedUrl, directions } = site.contact

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
        {mapEmbedUrl && (
          <iframe
            title="Map"
            src={mapEmbedUrl}
            loading="lazy"
            className="aspect-square w-full rounded-md border-0 grayscale dark:invert-[.9]"
          />
        )}
      </div>
    </>
  )
}
