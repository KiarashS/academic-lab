// Lab members. `id` is used in URLs (/people/:id) and to link people to projects.
//
// Fields (all optional except id, name, group):
//   role, photo (path in public/ or URL), email, website, scholar, github, orcid,
//   twitter, linkedin, bluesky, bio (string or array of paragraphs), interests [],
//   education [], aliases [] (other spellings used in author lists, e.g. 'A. Rivera'),
//   management: 'Title on the management team' (see site.people.management),
//   alumni: true + now: 'Where they went'
//
// `group` can be left out for people who only belong to the management team.

const people = [
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    role: 'Associate Professor',
    group: 'Principal Investigator',
    management: 'Director',
    photo: null,
    email: 'arivera@example.edu',
    website: 'https://example.edu/~arivera',
    scholar: 'https://scholar.google.com/',
    github: 'https://github.com/',
    orcid: 'https://orcid.org/0000-0000-0000-0000',
    aliases: ['A. Rivera'],
    bio: [
      'Alex Rivera is an Associate Professor of Computer Science at Example University, where they lead the Example Lab.',
      'Before joining Example University in 2019, they were a postdoctoral fellow at Another Institute. They received a PhD in Computer Science from State University in 2016.',
    ],
    interests: ['Few-shot learning', 'Probabilistic modeling', 'Scientific machine learning'],
    education: [
      'PhD, Computer Science, State University, 2016',
      'BS, Mathematics, City College, 2010',
    ],
  },
  {
    id: 'sam-chen',
    name: 'Sam Chen',
    role: 'Postdoctoral Researcher',
    group: 'Postdoctoral Researchers',
    email: 'schen@example.edu',
    github: 'https://github.com/',
    aliases: ['S. Chen'],
    bio: 'Sam works on uncertainty estimation for small-sample regimes. PhD from Tech Institute, 2023.',
    interests: ['Uncertainty quantification', 'Bayesian deep learning'],
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    role: 'PhD Student (4th year)',
    group: 'PhD Students',
    website: 'https://example.com',
    aliases: ['P. Nair'],
    bio: 'Priya builds meta-learning methods for protein property prediction.',
    interests: ['Meta-learning', 'Computational biology'],
  },
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    role: 'PhD Student (2nd year)',
    group: 'PhD Students',
    github: 'https://github.com/',
    aliases: ['J. Lee'],
    bio: 'Jordan studies data augmentation for scientific time series.',
  },
  {
    id: 'mia-okafor',
    name: 'Mia Okafor',
    role: 'MS Student',
    group: "Master's Students",
    bio: 'Mia works on benchmarks for low-resource medical imaging.',
  },
  {
    id: 'lucas-weber',
    name: 'Lucas Weber',
    role: 'Undergraduate Researcher',
    group: 'Undergraduate Researchers',
  },
  {
    id: 'dana-brooks',
    name: 'Dana Brooks',
    role: 'Lab Manager',
    management: 'Lab Manager',
    email: 'dbrooks@example.edu',
    bio: 'Dana manages the lab\'s budget, purchasing, compute resources and onboarding.',
  },
  {
    id: 'ruth-abebe',
    name: 'Ruth Abebe',
    role: 'Program Coordinator',
    management: 'Program Coordinator',
    bio: 'Ruth coordinates the lab\'s industry partnerships and events.',
  },
  {
    id: 'hana-sato',
    name: 'Hana Sato',
    role: 'PhD, 2024',
    group: 'PhD Students',
    alumni: true,
    now: 'Research Scientist, Example AI',
    aliases: ['H. Sato'],
  },
  {
    id: 'omar-haddad',
    name: 'Omar Haddad',
    role: 'MS, 2023',
    group: "Master's Students",
    alumni: true,
    now: 'PhD student, Another University',
  },
]

export default people
