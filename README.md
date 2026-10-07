# Academic lab website

A minimal website for a research group, built with React, React Router, Vite and Tailwind CSS v4. Settings live in one file (`src/config/site.js`) and content lives in plain Markdown and YAML files (`content/`), which lab members can also edit in the browser.

## Pages

- Home: image/video slider, intro, notices, a hiring notice while positions are open, latest news, upcoming events, recent talks, current projects, featured publications (with their plain-language summaries), funders, a newsletter sign-up, and text blocks of your own
- Research: current and past projects, each with its own page listing its people and papers
- People: members grouped by role, an optional management team, alumni, and a profile page per person with their papers (and a papers-per-year chart), talks and awards
- Publications: search and filters by type, year, author and tag (kept in the URL so a filtered view can be shared), abstracts, BibTeX per paper and for the whole or filtered list, citation counts from Semantic Scholar, and a papers-per-year chart that follows the filters (click a bar to filter by that year). Each paper has its own page, with an optional plain-language summary above the abstract, with a citation to copy and the tags Google Scholar uses to index it. Papers can be imported from BibTeX files and ORCID.
- News: one-line items, or full posts with their own page, an RSS feed, and an optional email sign-up
- Events: upcoming and past events, event pages, "Add to calendar" files and a calendar feed people can subscribe to
- Talks: invited talks, keynotes and lectures by lab members, with slides and video links
- Awards & press: awards to the lab and its members, and media coverage
- Collaborators: partner groups on a world map and in a list
- Software & Data, Teaching, Gallery (albums of photos and videos with a full-screen viewer), Join and Contact (with a map and an optional contact form)

The header has a Home link, dropdown groups for less-used pages, site-wide search (Ctrl+K, Cmd+K or `/`) and a light/dark/system switch. Lab members' names are bolded and linked in every author list.

Every page is built as a complete HTML file: the page content is already there before any JavaScript runs, so search engines, link previews and visitors with JavaScript off all see it. Each page also gets its own title, description, generated social preview image and schema.org structured data, and the build writes `sitemap.xml` and `robots.txt`. Photos are resized at build time.

## Getting started

```sh
npm install
npm run dev      # http://localhost:5173 (reloads when you edit content/)
npm run build    # static site in dist/
npm run preview  # serve dist/ locally
```

## Content

Everything visitors read is in `content/`:

| Path | What |
| --- | --- |
| `content/people/*.md` | One file per person. Front matter holds name, role, group, links and so on; the text below it is the bio. The file name is the URL (`alex-rivera.md` → `/people/alex-rivera`). |
| `content/research/*.md` | One file per project; the text is the project description. |
| `content/news/*.md` | One file per news item. `text` is the line shown in lists. Write text below the front matter to give the item its own page. |
| `content/events/*.md` | One file per event: `title`, `date`, optional `endDate`, `time` and `end` (24-hour `HH:MM`), `speaker`, `affiliation`, `location`, `link`, `summary`. Text below the front matter gives the event its own page. |
| `content/publications.yml` | Papers entered by hand. |
| `content/publications.bib` | Papers in BibTeX, e.g. exported from Zotero or Google Scholar. |
| `content/slides.yml` | Home page slider: images, videos, or YouTube/Vimeo videos that load only when a visitor presses play. |
| `content/gallery.yml` | Albums of photos and videos (files, direct links, YouTube or Vimeo). |
| `content/talks.yml` | Talks by lab members. |
| `content/press.yml` | Awards (`awards:`) and media coverage (`press:`). |
| `content/collaborators.yml` | Collaborating groups, with coordinates for the map. |
| `content/resources.yml` | Software and datasets. |
| `content/teaching.yml`, `content/join.yml`, `content/funders.yml` | Courses, open positions, funder logos. |
| `content/home/*.md` | Text blocks for the home page (see below). |
| `content/notices.yml` | Notices for the home page or a bar on every page (see below). |

`npm run check` reads all content and lists problems, such as a project member with no file in `content/people/`, a paper linked to a project that doesn't exist, a group name that isn't in the settings, a badly written date or time, or a missing image. The same checks run on every build (as warnings) and on every pull request (where they fail the check).

Each YAML file starts with a comment listing its fields. Some things to know:

- Images and files go in `public/uploads/` and are referenced as `/uploads/name.jpg`. Full URLs also work. People without a photo get their initials.
- Markdown is supported in bios, project descriptions, news posts and event pages: headings, lists, links, images, tables. Links to `/publications#<paper id>` jump to one paper.
- People and projects are sorted by `order` (lower first), then by name or title.
- Add `aliases` to a person (e.g. `A. Rivera`) so shortened names in author lists are still recognized.
- Link a paper to a project by listing the project's file name in the paper's `projects`.
- Set `featured: true` on a paper to show it on the home page.
- Give a person a `management` title (e.g. `Lab Manager`) to list them in the management team. Mark a person `alumni: true` and add `now` to move them to Alumni.

### How much the home page shows

Each list section on the home page shows at most `count` items: `home.news.count` (4), `home.events.count` (3), `home.research.count` (4), `home.publications.count` (3), `home.funders.count` (8) and `home.notices.count` (3). The rest are a click away through the section's "All …" link. Set a count to `null` to show everything.

### Intro image

`home.intro.image` adds a picture to the intro, such as a group photo or a figure from your work. `home.intro.imagePosition` places it: `right` or `left` puts it beside the text on screens 1024px and wider (cropped to 4:3) and below the text on smaller screens (16:9); `below` shows it full width under the text at its own shape. Add `imageAlt` to describe it for screen readers. The site ships with a placeholder image on the right; replace it with your own.

### Notices

`content/notices.yml` (or "Lists → Notices" in `/admin`) holds short announcements of any kind: a lab move, a deadline, a call for papers, a closure. Each notice has `text` and optionally:

- `link`: `{ label, url }`, shown after the text
- `placement`: `home` (the default) shows it in the home page's `notices` section; `site` shows it as a slim bar above the header on every page
- `style`: `accent` (the default), `info`, `success` or `warning`
- `from` / `until`: dates between which it shows (both included). The nightly rebuild and the visitor's own date both respect them, so an expired notice disappears on time.
- `dismissible: true`: adds a close button. The browser remembers the choice; give the notice a new `id` to show it again.

### Home page text blocks and hiring notice

Write a Markdown file in `content/home/` (or use "Home page blocks" in `/admin`) and add `block:<file name>` to `home.sections` where it should appear, e.g. `'block:approach'` for `content/home/approach.md`. A block can have a `title`, a `style` (`plain` or `highlight`, a tinted box), an `image` shown beside the text (`imagePosition: left` or `right`) and a `link`.

The `hiring` section shows a one-line notice with a link to the Join page while at least one position in `content/join.yml` has `open: true`, and disappears when none do. By default it lists the open positions; set `home.hiring.text` to write your own.

### Photos

Put photos in `public/uploads/` (the editor at `/admin` does this for you) at whatever size you have. The build makes WebP copies at several widths and each page loads the smallest one that looks sharp on the visitor's screen, so a large photo from a phone doesn't slow the site down. SVGs, GIFs and images on other sites are used as they are.

### Importing publications

Papers come from three places, combined into one list. If a paper appears twice (same DOI or same title), the first source wins:

1. `content/publications.yml`, entered by hand
2. BibTeX files in `content/`, listed in `publications.import.bibtex`. Standard fields are read as usual; a few extra ones are understood too: `code`, `data`, `slides`, `video`, `poster`, `project` and `pdf` become links, `featured = {true}` shows the paper on the home page, `award` adds a label, `summary` adds a plain-language summary, `media` adds an image or video beside it, and `projects` links it to research projects.
3. ORCID: put ORCID iDs in `publications.import.orcid`, e.g. `['0000-0002-1825-0097']`. Public works are fetched at build time; no API key is needed. If ORCID can't be reached, the build continues without those papers and prints a warning. Pushes to `main` rebuild the site, so new ORCID works show up with the next push, or with a manual run of the deploy workflow.

### Paper pages, Google Scholar and citation counts

Each paper gets a page at `/publications/<id>` with its abstract, links, a citation in APA style and BibTeX to copy, and the projects it belongs to. The page carries the `citation_*` meta tags Google Scholar reads; with a PDF link on the paper, Scholar can index it from your site. Turn the pages off with `publications.pages: false`.

Citation counts come from [Semantic Scholar](https://www.semanticscholar.org), looked up by the paper's DOI or arXiv link when the site builds and shown as "Cited by N". Papers Semantic Scholar doesn't know show no count. Turn this off with `publications.citations.show: false`.

## Editing in the browser

`/admin` (e.g. `https://lab.kiarashs.ir/admin/`) opens [Sveltia CMS](https://github.com/sveltia/sveltia-cms), an editor for everything in `content/`. Saving commits the change to GitHub, and the deploy workflow publishes it a minute or two later. Nothing runs on a server.

To sign in:

- Access token (no setup): create a fine-grained personal access token on GitHub with read and write access to this repository's Contents, then choose "Sign In Using Access Token".
- "Sign In with GitHub" button: deploy the small [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) worker on Cloudflare (free) and put its address in `base_url` in `public/admin/config.yml`.
- Local: while `npm run dev` is running, open `http://localhost:5173/admin/` in Chrome or Edge and choose "Work with Local Repository" to edit the files on your computer without GitHub.

The editor's fields are defined in `public/admin/config.yml`. If you add a field to your content, add it there too so it shows up in the editor. Update `repo` there if you fork or rename the repository.

## Settings

All settings are in `src/config/site.js`. Settings you delete fall back to `src/config/defaults.js`, so removing one never breaks the build.

Turning things on and off:

- Pages: remove a page from `nav` to take it off the site. Add `menu: false` to keep the page but hide its menu link. Put pages in `{ label: 'More', items: [...] }` to group them under a dropdown. Links to a removed page disappear elsewhere too.
- Sections: each page has a `sections` list that sets which sections appear and in what order. Delete an entry to hide it; reorder entries to move it.

| Page | Settings | Sections |
| --- | --- | --- |
| Header | `header` (logo, name, search, theme toggle) | |
| Home | `home` (slider timing, intro, hiring notice, section titles, item counts, "All …" link text, paper summaries) | `slider`, `intro`, `notices`, `hiring`, `news`, `events`, `research`, `publications`, `funders`, `talks`, `newsletter`, `block:<name>` |
| Research | `research` (title, intro, headings, tags) | `current`, `past` |
| Project page | `research.project` | `description`, `funding`, `links`, `people`, `publications` |
| People | `people` (groups, management team, alumni heading, photos, author highlighting) | `members`, `alumni` |
| Person page | `people.profile` | `links`, `bio`, `interests`, `education`, `projects`, `publications`, `talks`, `awards` |
| Publications | `publications` (Scholar link, import, paper pages, citation counts, chart on the page and on profiles, summary heading, type labels, grouping, count, BibTeX, abstracts, download) | `filters`: `search`, `type`, `year`, `author`, `tag` |
| Paper page | `publications.pages` (on or off), `publications.page` | `media`, `links`, `summary`, `abstract`, `cite`, `related` |
| News | `news` (title, intro, group by year, RSS, "Read more" text) | |
| Events | `events` (title, intro, headings, time zone, subscribe link, "Add to calendar" links) | `upcoming`, `past` |
| Talks | `talks` (title, intro, group by year, type labels) | |
| Awards & press | `press` (title, intro, headings) | `awards`, `press` |
| Collaborators | `collaborators` (title, intro, mark the lab on the map) | `map`, `list` |
| Software & Data | `resources` (title, intro, headings) | `software`, `dataset`, `other` |
| Teaching | `teaching` (instructor and description on or off) | |
| Gallery | `gallery` (title, intro) | |
| Join | `join` (title, headings, closed positions) | `intro`, `positions`, `apply` |
| Contact | `contact` (details, map, form) | `email`, `phone`, `address`, `directions`, `map`, `form` |
| Footer | `footer` (on or off, text, links, "Built with" credit) | `copyright`, `institution`, `social`, `credit` |

Site-wide: `name`, `tagline`, `description`, `institution`, `url` (sitemap, RSS and canonical links), `ogImage` (social previews), `favicon`, `locale` (date format), `theme` (accent colors, font, default light/dark mode), `socialImages`, `analytics` (with `cookieConsent`), `newsletter` and `linkCheck`.

### Feeds and calendars

- News RSS is at `/news.xml` when `news.rss` is on and `url` is set. The News page links to it.
- `/events.ics` is a calendar feed with every event; the Events page offers a "Subscribe" link, so calendar apps pick up new events automatically. Each event also has its own `.ics` file behind "Add to calendar". Set `events.timezone` to the time zone your event times are written in.

### News by email

A static site can't send email, so a mailing service keeps the subscriber list and sends the emails. The simplest is [Buttondown](https://buttondown.com) (free for small lists): create an account, set `newsletter.provider: 'buttondown'` and `newsletter.buttondown` to your username, and turn on its RSS-to-email feature with your `/news.xml` address so every new post goes out by itself. For Mailchimp, MailerLite or similar, set `provider: 'form'`, `action` to the form address from the service's embed code, and `emailField` to its email field's name (Mailchimp uses `EMAIL`).

`newsletter.placement` sets where the sign-up box appears: `news` (News page), `post` (end of each news post), `footer` (every page). Add `newsletter` to `home.sections` to show it on the home page.

### Broken links

Links to other websites break as people move and pages disappear. `.github/workflows/links.yml` builds the site every night, checks every outside link, and keeps one GitHub issue labelled `broken-links` up to date with the ones that fail and the pages they're on. The issue closes itself once they're fixed. Run it from the Actions tab any time, or locally with `npm run build && npm run links`. Some sites (LinkedIn, Google Scholar, some publishers) refuse automated checks; those are listed separately as "could not be checked", and you can skip them with `linkCheck.ignore` in `site.js`. `linkCheck.enabled: false` turns the check off.

### Analytics and cookie consent

Fill in one option under `analytics` in `site.js`: Plausible (`domain`), Umami (`websiteId`) or Google Analytics (`googleAnalytics: 'G-…'`). All three count page changes inside the site automatically.

Google Analytics sets cookies, so by default (`analytics.cookieConsent: true`) visitors first see a banner asking for consent, and Google Analytics only loads after they accept. The choice is remembered, and a "Cookie settings" link in the footer lets them change it. Plausible and Umami don't use cookies and never show the banner.

### Contact form

A static site can't send email, so the optional form on the Contact page goes through a free form service that emails each message to you. Sign up with [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com), then set `contact.form.provider` to `'formspree'` or `'web3forms'` and fill in `formspreeId` or `web3formsKey`. The form has name, email and message fields and a hidden field that catches most spam bots.

### Images and videos beside papers and events

Give a publication or an event a `media` field and it shows beside it in lists and at the top of its page, as on many HCI lab sites. It can be an image or GIF (`/uploads/teaser.gif`), an MP4 or WebM video, which plays silently on a loop while on screen like a GIF, or a YouTube or Vimeo link, which shows a thumbnail and plays when pressed. Write `media: { src: ..., alt: ..., poster: ... }` when you need a description or a poster frame. Visitors who have asked their system for reduced motion see videos paused, with controls.

`publications.media` and `events.media` set where it goes (`position: 'right'` or `'left'`; on phones it goes below or above the text), how wide it is, and `aspect`, which crops every item to the same shape (`'16 / 10'`, `'1 / 1'`) or, with `null`, keeps each one's own. Right is the default: titles stay lined up whether or not an item has media.

### Site icon

Set `favicon` to one image in `public/`: an SVG, or a square PNG at least 512×512 pixels. The build makes everything else from it: `favicon.ico` (16, 32 and 48 px), the 180 px iPhone home-screen icon, 192 and 512 px icons and a maskable icon for Android, and `site.webmanifest`, and adds the right tags to every page. Replace the file and rebuild to change the icon everywhere. iPhone and Android need a solid square behind the icon; its color is `faviconBackground`.

### Footer credit

The footer ends with "Built with ♥ by Kiarash", linking to the author of this template. **Please do not change or remove it.** Keep `footer.credit` in `src/config/site.js` as it is and keep `'credit'` in `footer.sections`. Everything else in the footer (copyright line, institution, social links) is yours to change.

The photo in the credit is loaded from a fixed address on GitHub (`avatars.githubusercontent.com/u/1054134`), not from this repository, so it stays the same in every copy of the template, and you don't need to keep any image file for it.

### Social preview images

When a page is shared on social media or in a chat app, it shows a 1200×630 image with the page title, a subtitle and the lab name, generated for every page at build time (`socialImages: true`, needs `url`). Pages with their own image, such as a project or news post with `image`, use that instead.

### Adding a page

Create a component in `src/pages/`, register it in the `PAGES` map in `src/App.jsx`, and add it to `nav` in `site.js`. Styling uses Tailwind utility classes; the accent color is available as `text-accent`, `bg-accent` and so on, and global styles are in `src/index.css`.

## Deploying

The site builds to static files and works on any static host.

URLs are plain paths such as `/people/alex-rivera`. The build writes an HTML file for every page (`people/alex-rivera.html`, `people.html` and so on), which GitHub Pages, Netlify and Cloudflare Pages serve at the extensionless URL with a 200 status. Any other URL gets `404.html`, which shows the site's "Page not found" view. On a host that doesn't resolve `.html` extensions, configure a fallback to `index.html`, or set `router: 'hash'` in `site.js` to use `/#/people` URLs instead.

`npm run build` runs three steps: the browser build, a server-side build of the same app, and `scripts/prerender.js`, which renders every page to HTML and writes its head, the social images, feeds, calendar files and sitemap. Content is read by `scripts/content.js`. Restart `npm run dev` after changing `site.js`.

If the site is served from a subpath, build with `BASE_PATH`, e.g. `BASE_PATH=/academic-lab/ npm run build`. The GitHub Pages workflow sets it for you.

### GitHub Pages

`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`, including commits made from `/admin`, and again every night so ORCID papers, citation counts and upcoming events stay current. In the repository settings, set Pages > Source to "GitHub Actions". GitHub pauses nightly runs in repositories with no commits for 60 days; any push or a manual run from the Actions tab starts them again.

`.github/workflows/check.yml` runs `npm run check` and a full build on every pull request.

To use a custom domain, set it under Settings > Pages and put the same address in `site.url` and in `site_url` in `public/admin/config.yml`.
