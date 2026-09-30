import PublicationItem from './PublicationItem.jsx'

// Publications grouped under year headings.
export default function PublicationList({ publications }) {
  const years = []
  for (const pub of publications) {
    const last = years[years.length - 1]
    if (last && last.year === pub.year) last.items.push(pub)
    else years.push({ year: pub.year, items: [pub] })
  }

  return (
    <div className="space-y-10">
      {years.map(({ year, items }) => (
        <section key={year} className="grid gap-4 sm:grid-cols-[5rem_1fr]">
          <h2 className="text-sm font-medium text-neutral-500 tabular-nums dark:text-neutral-400">{year}</h2>
          <div className="space-y-7">
            {items.map((pub) => (
              <PublicationItem key={pub.id} pub={pub} showYear={false} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
