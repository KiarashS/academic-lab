// Research projects. `id` is used in URLs (/research/:id).
// Link publications to a project by adding its id to the publication's `projects` array.
//
// Fields: id, title, summary, description (string or paragraphs), image, status ('active' | 'past'),
//         tags [], members [person ids], links [{ label, url }], funding

const research = [
  {
    id: 'few-shot-science',
    title: 'Few-shot learning for scientific data',
    summary:
      'Models that adapt to a new experimental system from tens of measurements instead of thousands.',
    description: [
      'Most scientific datasets are small. A new assay or instrument might produce a few dozen labeled measurements before a project has to decide what to try next.',
      'We build meta-learning methods that transfer structure across related experiments, and we test them on protein engineering, materials screening and single-cell data.',
    ],
    status: 'active',
    tags: ['meta-learning', 'biology'],
    members: ['alex-rivera', 'priya-nair', 'jordan-lee'],
    links: [{ label: 'Code', url: 'https://github.com/' }],
    funding: 'NSF CAREER Award #0000000',
  },
  {
    id: 'calibrated-uncertainty',
    title: 'Calibrated uncertainty with little data',
    summary: 'Uncertainty estimates that stay honest when the training set has fewer than 100 examples.',
    description:
      'Standard calibration methods need a held-out set, which small-data problems cannot spare. We study priors and resampling schemes that produce calibrated predictions without one.',
    status: 'active',
    tags: ['uncertainty', 'bayesian'],
    members: ['alex-rivera', 'sam-chen'],
  },
  {
    id: 'medical-benchmarks',
    title: 'Low-resource medical imaging benchmarks',
    summary: 'Public benchmarks for evaluating models trained on small clinical datasets.',
    status: 'past',
    tags: ['benchmarks', 'medicine'],
    members: ['mia-okafor', 'omar-haddad'],
  },
]

export default research
