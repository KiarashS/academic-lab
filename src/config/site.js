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
  // Public address of the site, used for the sitemap, canonical links and social previews.
  // Leave empty if you don't know it yet.
  url: 'https://lab.kiarashs.ir',
  // Optional logo shown in the header. Path relative to public/, or a full URL.
  logo: null,
  // Browser tab icon, relative to public/.
  favicon: 'favicon.svg',
  // Image shown when a page is shared on social media (about 1200x630), relative to public/.
  ogImage: null,
  // Language and locale for dates, e.g. 'en-US', 'en-GB', 'de-DE'.
  locale: 'en-US',

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

  // 'browser' gives clean URLs (/people/alex-rivera). The build writes a 404.html copy of
  // index.html so static hosts like GitHub Pages can serve every route.
  // 'hash' gives /#/people/alex-rivera URLs and works on hosts with no fallback at all.
  router: 'browser',

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
    // Image/video slider at the top of the home page. Slides are in src/content/slides.js.
    slider: {
      show: true,
      autoplay: true,
      interval: 6000, // ms each image stays up; videos play to the end
      aspectRatio: '21 / 9', // any CSS aspect-ratio; phones use 4 / 3
    },
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
    // Optional management team. Anyone with a `management` field in src/content/people.js
    // is listed here with that title. Set show to false to hide the section.
    management: {
      show: true,
      title: 'Management team',
      // Group the section appears after. null puts it at the top of the page.
      after: 'Principal Investigator',
    },
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
    // Map on the contact page. Set to null to hide it. Two ways to set it up:
    //   1. Coordinates: a map with a pin, from Google Maps or OpenStreetMap. No API key needed.
    //      Find them by right-clicking the building in Google Maps or OpenStreetMap.
    //   2. embedUrl: any embeddable map, e.g. the src="..." from Google Maps
    //      "Share > Embed a map". If set, it is used instead of the coordinates.
    map: {
      lat: 42.3601,
      lng: -71.0942,
      zoom: 16, // higher is closer; 15-17 suits a single building
      provider: 'google', // 'google' | 'openstreetmap'
      embedUrl: null,
      // Shown under the map as "Open in Google Maps" / "Directions". Set to false to hide.
      showLinks: true,
    },
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
