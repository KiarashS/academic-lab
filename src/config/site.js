// Site-wide settings. Content (people, papers, news...) lives in the content/ folder,
// which you can also edit in the browser at /admin (see README).
//
// How to turn things on and off:
//   - Pages: remove a page from `nav` to remove it from the site, or set `menu: false`
//     to keep the page but hide its menu link.
//   - Sections: every page has a `sections` list. It sets which sections appear and in
//     what order. Delete an entry to hide that section; reorder entries to move them.
//   - Anything you delete from this file falls back to the default in defaults.js, so
//     removing a setting never breaks the site.

const site = {
  // Identity
  name: 'Example Lab',
  shortName: 'Example Lab', // shown in the header on small screens
  tagline: 'We study how machines learn from limited data.',
  description: 'The Example Lab is a research group in the Department of Computer Science at Example University.',
  institution: {
    name: 'Department of Computer Science, Example University',
    url: 'https://example.edu',
  },
  // Public address of the site, used for the sitemap, canonical links and social previews.
  // Leave empty if you don't know it yet.
  url: 'https://lab.kiarashs.ir',
  // Site icon, relative to public/: an SVG, or a square PNG at least 512x512. The build
  // makes favicon.ico, the home-screen icons for iPhone and Android, and a web app
  // manifest from it, so replacing this one file updates the icon everywhere.
  favicon: 'favicon.svg',
  // Background behind the icon where a platform needs a solid square (iPhone home screen,
  // Android's shaped icons).
  faviconBackground: '#ffffff',
  // Image shown when a page is shared on social media (about 1200x630), relative to public/.
  // Pages without their own image get a generated one (see socialImages).
  ogImage: null,
  // Generate a preview image for every page (title, subtitle and lab name on a plain
  // background) when it is shared on social media or in chat apps. Needs `url` above.
  socialImages: true,
  // Language and locale for dates, e.g. 'en-US', 'en-GB', 'de-DE'.
  locale: 'en-US',

  // Appearance
  theme: {
    // Any CSS color. Used for links, highlights and focus rings.
    accent: '#2563eb',
    accentDark: '#60a5fa', // accent used in dark mode
    // 'system' | 'light' | 'dark'
    defaultMode: 'system',
    // CSS font-family stack.
    font: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  // 'browser' gives clean URLs (/people/alex-rivera). 'hash' gives /#/people/alex-rivera
  // URLs, for hosts that can't serve the per-page HTML files the build writes.
  router: 'browser',

  header: {
    // Logo next to the lab name. Path relative to public/, or a full URL. null for none.
    logo: null,
    showName: true,
    // Light/dark/system switch.
    showModeToggle: true,
    // Search box (also opens with Ctrl+K / Cmd+K or "/"). Covers people, projects,
    // publications, news, events and software.
    showSearch: true,
  },

  // Visitor statistics. Fill in one of these to turn it on; leave them empty for none.
  analytics: {
    // Plausible (privacy-friendly, no cookie banner needed): the domain you registered.
    plausible: { domain: '', src: 'https://plausible.io/js/script.js' },
    // Umami (privacy-friendly, can be self-hosted): the website ID from your dashboard.
    umami: { websiteId: '', src: 'https://cloud.umami.is/script.js' },
    // Google Analytics 4 measurement ID, e.g. 'G-XXXXXXX'.
    googleAnalytics: '',
    // Google Analytics sets cookies, which in the EU and UK needs the visitor's consent.
    // With this on, a banner asks first and Google Analytics only loads after "Accept".
    // (Plausible and Umami don't use cookies and never show the banner.)
    cookieConsent: true,
    consentText: 'This site uses cookies from Google Analytics to count visits.',
  },

  // Pages, in menu order. Remove an entry to remove the page and its URL.
  // `menu: false` keeps the page reachable (e.g. from a link on the home page) but
  // hides it from the menu. The label is the menu text; the page heading is set below.
  // `{ label, items: [...] }` makes a dropdown group, for pages people visit less often.
  // Available pages: home, research, people, publications, news, events, talks, teaching,
  // resources (software & data), gallery, press (awards & press), collaborators, join, contact.
  // Pages of your own: write content/pages/<name>.md (title, intro, then Markdown text) and
  // add { page: '<name>', label: '...' } here, e.g. 'facilities' below.
  nav: [
    { page: 'home', label: 'Home' },
    { page: 'research', label: 'Research' },
    { page: 'people', label: 'People' },
    { page: 'publications', label: 'Publications' },
    { page: 'news', label: 'News' },
    { page: 'events', label: 'Events' },
    {
      label: 'More',
      items: [
        { page: 'talks', label: 'Talks' },
        { page: 'resources', label: 'Software & Data' },
        { page: 'teaching', label: 'Teaching' },
        { page: 'press', label: 'Awards & Press' },
        { page: 'collaborators', label: 'Collaborators' },
        { page: 'facilities', label: 'Facilities' },
        { page: 'gallery', label: 'Gallery' },
        { page: 'join', label: 'Join' },
      ],
    },
    { page: 'contact', label: 'Contact' },
  ],

  home: {
    // slider | intro | notices | hiring | news | events | talks | research | publications |
    // funders | newsletter
    // notices are the placement: home notices in content/notices.yml;
    // plus your own text blocks: 'block:<name>' shows content/home/<name>.md
    sections: ['slider', 'intro', 'notices', 'hiring', 'news', 'events', 'research', 'block:approach', 'publications', 'funders'],

    // Slides are in content/slides.yml.
    slider: {
      autoplay: true,
      interval: 6000, // ms each image stays up (a slide's own `duration` wins); videos play to the end
      progress: true, // thin bar along the bottom showing time to the next slide
      aspectRatio: '21 / 9', // any CSS aspect-ratio
      mobileAspectRatio: '4 / 3', // the same on screens narrower than 640px
    },
    intro: {
      heading: null, // null uses `tagline` above
      text: [
        'We develop methods that let learning systems generalize from a handful of examples, and we apply them to problems in biology, medicine and the physical sciences.',
        'The lab is part of the Department of Computer Science at Example University and is funded by the NSF, the NIH and industry partners.',
      ],
      // Optional image (path relative to public/, e.g. /uploads/group.jpg, or a full URL).
      // Replace the placeholder below with a group photo or a figure from your work.
      image: '/slides/slide-2.svg',
      imageAlt: 'Abstract green illustration of scattered data points along a curve', // describe the image for screen readers
      imageCaption: '',
      // below: under the text, full width
      // right | left: beside the text on screens 1024px and wider, below it on smaller ones
      imagePosition: 'right',
    },
    // `count` is the most items each section shows on the home page (newest or first ones);
    // the rest are a click away through the "All …" link. null shows everything.
    news: { title: 'News', count: 4, moreLink: 'All news' },
    // Current (not past) projects.
    research: { title: 'Research', count: 4, moreLink: 'All projects' },
    // Publications marked `featured: true`.
    // showSummary: each paper's plain-language summary under it
    publications: { title: 'Selected publications', count: 3, moreLink: 'All publications', showSummary: true },
    // Events that haven't happened yet.
    events: { title: 'Upcoming events', count: 3, moreLink: 'All events' },
    // Logos from content/funders.yml.
    funders: { title: 'Funding', count: 8 },
    // Notices from content/notices.yml with placement: home.
    notices: { count: 3 },
    // A notice linking to the Join page. It only appears while at least one position in
    // content/join.yml is open. text: null lists the open positions ("We're hiring: PhD
    // students, Postdoctoral researcher."); set your own text to replace it.
    hiring: { text: null, linkLabel: 'See open positions' },
  },

  research: {
    title: 'Research',
    intro: 'Current and past projects in the lab.',
    // current | past
    sections: ['current', 'past'],
    currentTitle: 'Current projects',
    pastTitle: 'Past projects',
    showTags: true,
    // Each project's own page.
    project: {
      // description | funding | links | people | publications
      sections: ['description', 'funding', 'links', 'people', 'publications'],
      peopleTitle: 'People',
      publicationsTitle: 'Publications',
    },
  },

  people: {
    title: 'People',
    intro: null,
    // members | alumni
    sections: ['members', 'alumni'],
    // Groups in display order. A person's `group` must match one of these.
    groups: [
      'Principal Investigator',
      'Postdoctoral Researchers',
      'PhD Students',
      "Master's Students",
      'Undergraduate Researchers',
      'Staff',
    ],
    // Optional management team. Anyone with a `management` field in content/people/
    // is listed here with that title. Set show to false to hide the section.
    management: {
      show: true,
      title: 'Management team',
      // Group the section appears after. null puts it at the top of the page.
      after: 'Principal Investigator',
    },
    alumniTitle: 'Alumni',
    // Show photos (or initials when there is no photo) on the People page.
    showPhotos: true,
    // Bold and link lab members' names in author lists across the site.
    highlightInAuthorLists: true,
    // Each person's own page.
    profile: {
      // links | bio | interests | education | projects | publications | talks | awards
      sections: ['links', 'bio', 'interests', 'education', 'projects', 'publications', 'talks', 'awards'],
      interestsTitle: 'Interests',
      educationTitle: 'Education',
      projectsTitle: 'Projects',
      publicationsTitle: 'Publications',
      talksTitle: 'Talks',
      awardsTitle: 'Awards',
    },
  },

  publications: {
    title: 'Publications',
    intro: null,
    // Link to the PI's Google Scholar page, shown under the heading. null to hide.
    scholarUrl: 'https://scholar.google.com/',
    // Filters above the list, in order: search | type | year | author | tag
    filters: ['search', 'type', 'year', 'author', 'tag'],
    // Authors offered in the author filter: 'members' (lab members only) or 'all'.
    authorFilter: 'members',
    groupByYear: true,
    showCount: true, // "6 publications"
    showDownload: true, // "Download BibTeX" for the whole or filtered list
    showBibtex: true, // BibTeX button on each paper
    showAbstract: true, // Abstract button on each paper
    // Papers are read from content/publications.yml, plus these sources. If the same paper
    // appears twice (same DOI or title), publications.yml wins, then BibTeX, then the imports below.
    import: {
      // BibTeX file(s) in content/. null for none.
      bibtex: 'publications.bib',
      // ORCID iDs whose public works are pulled in at build time, e.g. ['0000-0002-1825-0097'].
      orcid: [],
      // Semantic Scholar author IDs or profile links, e.g.
      // 'https://www.semanticscholar.org/author/Jane-Doe/1741101'. Semantic Scholar also
      // covers what DBLP lists, and is the more reliable of the two to fetch.
      semanticScholar: [],
      // DBLP person ids or profile links, e.g. 'https://dblp.org/pid/12/3456'. DBLP
      // sometimes blocks automated requests; if the build warns about that, download your
      // list from DBLP ("export bibliography" > BibTeX) and add that file to bibtex above.
      dblp: [],
      // Imported papers to leave out, by id or title (e.g. a talk listed as a paper).
      exclude: [],
    },
    // A page for each paper at /publications/<id>, with the tags Google Scholar reads to
    // index it, a citation in text and BibTeX, and links. Titles in lists link to it.
    pages: true,
    // What a paper's page shows, in order: media | links | summary | abstract | cite | related
    // (related = its research projects and tags)
    page: { sections: ['media', 'links', 'summary', 'abstract', 'cite', 'related'] },
    // "Cited by N" from Semantic Scholar, looked up by DOI or arXiv link at build time.
    citations: { show: true, label: 'Cited by' },
    // Bar chart of papers per year above the list (it follows the filters; click a bar to
    // filter by that year). profiles: the same chart on each person's page. Shown once
    // papers span minYears.
    chart: { show: true, profiles: true, minYears: 3, title: 'Publications per year' },
    // Heading for a paper's plain-language `summary`, shown above the abstract.
    summaryTitle: 'In brief',
    // A paper's `media` (image, GIF, video or YouTube/Vimeo link) beside it in lists and
    // at the top of its page. position: 'right' | 'left' (on phones it goes below or
    // above the text). aspect crops every one to the same shape, e.g. '16 / 10' or '1 / 1';
    // null keeps each one's own shape.
    media: { show: true, position: 'right', width: '13rem', aspect: '16 / 10' },
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
  },

  news: {
    title: 'News',
    intro: null,
    groupByYear: true,
    // RSS feed at /news.xml (needs `url` above).
    rss: true,
    // Link text for news items that have a full post.
    readMore: 'Read more',
  },

  // News by email. A static site can't send email, so a mailing service does: it keeps
  // the subscriber list and sends the emails. Pick one:
  //   'buttondown' -> buttondown: your Buttondown username. Buttondown can also send each
  //                   new post automatically from the RSS feed (Settings > RSS-to-email).
  //   'form'       -> action: the form URL from your service's embed code (Mailchimp,
  //                   MailerLite, ...), and emailField: the name of its email field
  //                   (Mailchimp uses 'EMAIL').
  // provider: null turns it off.
  newsletter: {
    provider: null,
    buttondown: '',
    action: '',
    emailField: 'email',
    title: 'Get our news by email',
    text: 'New posts from the lab in your inbox. Unsubscribe any time.',
    button: 'Subscribe',
    // Where the sign-up box appears: news (News page) | post (end of each news post) |
    // footer (every page). Add 'newsletter' to home.sections for the home page.
    placement: ['news', 'post'],
  },

  // Talks given by lab members, from content/talks.yml.
  talks: {
    title: 'Talks',
    intro: 'Invited talks, keynotes and lectures by members of the lab.',
    groupByYear: true,
    // Labels for the `type` field of each talk.
    types: {
      keynote: 'Keynote',
      invited: 'Invited talk',
      contributed: 'Contributed talk',
      tutorial: 'Tutorial',
      lecture: 'Lecture',
      panel: 'Panel',
      poster: 'Poster',
      other: 'Talk',
    },
  },

  // Awards and media coverage, from content/press.yml.
  press: {
    title: 'Awards & press',
    intro: null,
    // awards | press
    sections: ['awards', 'press'],
    awardsTitle: 'Awards',
    pressTitle: 'In the media',
  },

  // Collaborating groups, from content/collaborators.yml.
  collaborators: {
    title: 'Collaborators',
    intro: 'Groups we work with.',
    // map (world map with a dot for each collaborator that has coordinates) | list
    sections: ['map', 'list'],
    // Also mark the lab itself on the map, at contact.map's coordinates.
    showLab: true,
  },

  events: {
    title: 'Events',
    intro: null,
    // upcoming | past
    sections: ['upcoming', 'past'],
    upcomingTitle: 'Upcoming',
    pastTitle: 'Past events',
    // Time zone the event times in content/events/ are written in (IANA name, e.g.
    // 'Asia/Tehran', 'Europe/Berlin', 'America/New_York'). Used for calendar files.
    timezone: 'America/New_York',
    // "Subscribe" link to the calendar feed at /events.ics.
    showSubscribe: true,
    // "Add to calendar" links on upcoming events and event pages.
    calendarLinks: true,
    // An event's `media` beside it in lists and on its page; same options as
    // publications.media.
    media: { show: true, position: 'right', width: '11rem', aspect: '16 / 10' },
  },

  gallery: {
    title: 'Gallery',
    intro: null,
  },

  resources: {
    title: 'Software & Data',
    intro: 'Code and datasets released by the lab.',
    // software | dataset | other  (the `type` of each item in content/resources.yml)
    sections: ['software', 'dataset', 'other'],
    sectionTitles: { software: 'Software', dataset: 'Datasets', other: 'Other' },
    // For items with a GitHub repository (a GitHub link, or `repo: owner/name`): stars,
    // latest release and license, fetched when the site builds.
    github: true,
  },

  teaching: {
    title: 'Teaching',
    intro: null,
    showInstructor: true,
    showDescription: true,
  },

  join: {
    title: 'Join the lab',
    // intro | positions | apply  (the text is in content/join.yml)
    sections: ['intro', 'positions', 'apply'],
    positionsTitle: 'Positions',
    applyTitle: 'How to apply',
    showClosedPositions: true,
  },

  contact: {
    title: 'Contact',
    intro: null,
    // email | phone | address | directions | map | form
    // (the map sits beside the details on wide screens; the form goes below both)
    sections: ['email', 'phone', 'address', 'directions', 'map', 'form'],
    email: 'lab@example.edu',
    phone: '+1 (555) 010-0000',
    address: ['Room 404, Example Hall', '123 University Ave', 'Example City, ST 00000'],
    directions:
      'The lab is on the fourth floor of Example Hall. Visitors can park in Lot C and check in at the front desk.',
    // Two ways to set up the map:
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
      // "Open in Google Maps" and "Directions" links under the map.
      showLinks: true,
    },
    // Optional contact form. A static site can't send email itself, so messages go through
    // a free form service that emails them to you. Pick one and fill in its ID:
    //   'formspree'  -> formspreeId from https://formspree.io (e.g. 'xyzabcd')
    //   'web3forms'  -> web3formsKey from https://web3forms.com (an access key)
    // provider: null turns the form off.
    form: {
      provider: null,
      formspreeId: '',
      web3formsKey: '',
      title: 'Send us a message',
      success: 'Thanks, your message was sent. We will get back to you soon.',
    },
  },

  // The nightly link check (.github/workflows/links.yml). Links containing any of these
  // are skipped, e.g. sites that block automated checks: ['linkedin.com'].
  // enabled: false stops the check (an open issue is then closed).
  linkCheck: { enabled: true, ignore: [] },

  footer: {
    show: true,
    // copyright | institution | social | credit
    sections: ['copyright', 'institution', 'social', 'credit'],
    // "Built with ♥ by Kiarash", centered below the rest of the footer.
    //
    // PLEASE DO NOT CHANGE OR REMOVE THIS CREDIT. It credits the author of this site
    // template. Keep the name, link and photo as they are, and keep 'credit' in
    // `sections` above. The photo is loaded from a fixed address on GitHub, so it stays
    // the same in every copy of the template. See "Footer credit" in README.md.
    credit: {
      text: 'Built with',
      by: 'by',
      name: 'Kiarash',
      url: 'https://kiarashs.ir',
      avatar: 'https://avatars.githubusercontent.com/u/1054134?s=96',
    },
    // Leave empty to use "© <year> <name>".
    text: '',
    social: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'Google Scholar', url: 'https://scholar.google.com/' },
      { label: 'Bluesky', url: 'https://bsky.app/' },
    ],
  },
}

export default site
