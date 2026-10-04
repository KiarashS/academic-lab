import { Link } from 'react-router'
import worldDots from '../assets/world-dots.svg?url'
import Img from '../components/Img.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SmartLink from '../components/SmartLink.jsx'
import site, { pageEnabled } from '../config/index.js'
import { collaborators, projectById } from '../lib/data.js'
import useTitle from '../lib/useTitle.js'

// The map's extent (see src/assets/world-dots.svg): all longitudes, latitudes 84 to -58.
const TOP = 84
const BOTTOM = -58

function position(lat, lng) {
  return { left: `${((lng + 180) / 360) * 100}%`, top: `${((TOP - lat) / (TOP - BOTTOM)) * 100}%` }
}

const hasPoint = (c) => Number.isFinite(c?.lat) && Number.isFinite(c?.lng)

function Pin({ lat, lng, label, lab = false }) {
  return (
    // The hover area is larger than the dot; the label shows on hover.
    <span
      style={position(lat, lng)}
      className="group absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
    >
      <span
        className={`block rounded-full ring-2 ring-white dark:ring-neutral-950 ${
          lab ? 'size-3.5 bg-neutral-900 dark:bg-neutral-100' : 'size-2.5 bg-accent'
        }`}
      />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-neutral-900 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block dark:bg-neutral-100 dark:text-neutral-900">
        {label}
      </span>
    </span>
  )
}

function WorldMap({ items }) {
  const lab = site.collaborators.showLab && site.contact?.map
  const countries = new Set(items.map((c) => c.country).filter(Boolean))
  const summary = `World map with ${items.length} collaborating group${items.length === 1 ? '' : 's'}${
    countries.size ? ` in ${countries.size} countr${countries.size === 1 ? 'y' : 'ies'}` : ''
  }. The list below has the details.`
  return (
    <figure>
      <div role="img" aria-label={summary} className="relative aspect-[1440/568] w-full">
        <div
          aria-hidden="true"
          style={{ maskImage: `url(${worldDots})`, WebkitMaskImage: `url(${worldDots})` }}
          className="absolute inset-0 bg-neutral-200 [mask-size:100%_100%] dark:bg-neutral-800"
        />
        {items.map((c, i) => (
          <Pin key={i} lat={c.lat} lng={c.lng} label={c.institution || c.name} />
        ))}
        {hasPoint(lab) && <Pin lat={lab.lat} lng={lab.lng} label={site.name} lab />}
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent" aria-hidden="true" />
          Collaborators
        </span>
        {hasPoint(lab) && (
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-neutral-900 dark:bg-neutral-100" aria-hidden="true" />
            {site.shortName || site.name}
          </span>
        )}
      </figcaption>
    </figure>
  )
}

function CollaboratorList({ items }) {
  return (
    <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {items.map((c, i) => {
        const projects = (c.projects || []).map((id) => projectById[id]).filter(Boolean)
        return (
          <li key={i} className="flex gap-4">
            {c.logo && (
              <Img src={c.logo} sizes="3rem" alt="" loading="lazy" className="size-12 shrink-0 object-contain" />
            )}
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                {c.url ? <SmartLink to={c.url}>{c.institution || c.name}</SmartLink> : c.institution || c.name}
              </h3>
              {c.institution && (c.name || c.department) && (
                <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {[c.name, c.department].filter(Boolean).join(', ')}
                </p>
              )}
              {(c.city || c.country) && (
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {[c.city, c.country].filter(Boolean).join(', ')}
                </p>
              )}
              {projects.length > 0 && pageEnabled('research') && (
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {projects.map((p, j) => (
                    <span key={p.id}>
                      {j > 0 && ', '}
                      <Link to={`/research/${p.id}`} className="prose-link">
                        {p.title}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function Collaborators() {
  const config = site.collaborators
  useTitle(config.title)
  const located = collaborators.filter(hasPoint)
  const SECTIONS = {
    map: () =>
      located.length > 0 && (
        <div key="map" className="mb-14">
          <WorldMap items={located} />
        </div>
      ),
    list: () => collaborators.length > 0 && <CollaboratorList key="list" items={collaborators} />,
  }
  return (
    <>
      <PageHeader title={config.title} intro={config.intro} />
      {config.sections.map((key) => SECTIONS[key]?.())}
    </>
  )
}
