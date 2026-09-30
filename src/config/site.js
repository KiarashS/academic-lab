// Site-wide settings. Most customization happens here and in src/content/.

const site = {
  // Identity
  name: 'Example Lab',
  shortName: 'Example Lab', // shown in the header on small screens
  tagline: 'We study how machines learn from limited data.',
  description:
    'The Example Lab is a research group in the Department of Computer Science at Example University.',
  institution: {
    name: 'Department of Computer Science, Example University',
    url: 'https://example.edu',
  },
  // Optional logo shown in the header. Path relative to public/, or a full URL.
  logo: null,

  // Appearance
  theme: {
    // Any CSS color. Used for links, highlights and focus rings.
    accent: '#2563eb',
    accentDark: '#60a5fa', // accent used in dark mode
    // 'system' | 'light' | 'dark'
    defaultMode: 'system',
    // Set to false to hide the light/dark toggle.
    showModeToggle: true,
    // CSS font-family stack.
    font: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  // 'hash' works on any static host (GitHub Pages included) with no server config.
  // 'browser' gives clean URLs but needs the server to fall back to index.html.
  router: 'hash',

  // Header navigation. Order here is the order in the menu.
  // Remove an entry to disable that page entirely (its route goes away too).
  // Available pages: research, people, publications, news, teaching, join, contact
  nav: [
    { page: 'research', label: 'Research' },
    { page: 'people', label: 'People' },
    { page: 'publications', label: 'Publications' },
    { page: 'news', label: 'News' },
    { page: 'teaching', label: 'Teaching' },
    { page: 'join', label: 'Join' },
    { page: 'contact', label: 'Contact' },
  ],

  home: {
    // Paragraphs shown under the tagline.
    intro: [
      'We develop methods that let learning systems generalize from a handful of examples, and we apply them to problems in biology, medicine and the physical sciences.',
      'The lab is part of the Department of Computer Science at Example University and is funded by the NSF, the NIH and industry partners.',
    ],
    // Optional image under the intro (path relative to public/ or full URL).
    image: null,
    imageCaption: '',
    // Sections on the home page, in order. Remove any you don't want.
    sections: ['news', 'research', 'publications'],
    newsCount: 4,
  },

  people: {
    // Groups in display order. A person's `group` must match one of these.
    groups: [
      'Principal Investigator',
      'Postdoctoral Researchers',
      'PhD Students',
      'Master\'s Students',
      'Undergraduate Researchers',
      'Staff',
    ],
    showAlumni: true,
    // Bold lab members' names in author lists across the site.
    highlightInAuthorLists: true,
  },

  publications: {
    // Labels for the `type` field of each publication.
    types: {
      journal: 'Journal',
      conference: 'Conference',
      workshop: 'Workshop',
      preprint: 'Preprint',
      book: 'Book / Chapter',
      thesis: 'Thesis',
      other: 'Other',
    },
    showBibtex: true,
    // Link to the PI's Google Scholar page, shown above the list. Set to null to hide.
    scholarUrl: 'https://scholar.google.com/',
  },

  contact: {
    email: 'lab@example.edu',
    phone: '+1 (555) 010-0000',
    address: ['Room 404, Example Hall', '123 University Ave', 'Example City, ST 00000'],
    // Optional map embed URL (e.g. from Google Maps "Share > Embed a map" or OpenStreetMap).
    mapEmbedUrl: null,
    directions:
      'The lab is on the fourth floor of Example Hall. Visitors can park in Lot C and check in at the front desk.',
  },

  // Links shown in the footer.
  social: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'Google Scholar', url: 'https://scholar.google.com/' },
    { label: 'Bluesky', url: 'https://bsky.app/' },
  ],

  footer: {
    // Leave empty to use "© <year> <name>".
    text: '',
  },
}

export default site
