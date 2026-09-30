// News items, newest first after sorting by date (YYYY-MM-DD).
// `text` is plain text. Add an optional `link: { label, url }` for an external link, or
// `internal: '/path'` + `linkLabel` for a page on this site. '/publications#<id>' jumps to one paper.

const news = [
  { date: '2026-09-01', text: 'Lucas Weber joins the lab as an undergraduate researcher. Welcome!' },
  {
    date: '2026-07-15',
    text: 'Priya presented our protein meta-learning paper as an oral at ICML 2026.',
    internal: '/publications#nair2026metaprot',
    linkLabel: 'Paper',
  },
  { date: '2026-05-20', text: 'Alex received the NSF CAREER award for work on few-shot learning in science.' },
  { date: '2026-03-10', text: 'New preprint on calibration without a validation set.', link: { label: 'arXiv', url: 'https://arxiv.org/' } },
  { date: '2025-08-30', text: 'Hana Sato defended her PhD and started at Example AI. Congratulations, Dr. Sato!' },
  { date: '2025-01-12', text: 'The SmallMed benchmark is now public.' },
]

export default news
