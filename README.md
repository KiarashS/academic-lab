# Academic lab website

A minimal website for a research group, built with React, React Router, Vite and Tailwind CSS v4. Settings live in one file (`src/config/site.js`) and content lives in plain Markdown and YAML files (`content/`), which lab members can also edit in the browser.

## Pages

- Home: image/video slider, intro, latest news, upcoming events, current projects, featured publications and funders
- Research: current and past projects, each with its own page listing its people and papers
- People: members grouped by role, an optional management team, alumni, and a profile page per person
- Publications: search and filters by type, year, author and tag (kept in the URL so a filtered view can be shared), abstracts, BibTeX per paper and for the whole or filtered list. Papers can be imported from BibTeX files and ORCID.
- News: one-line items, or full posts with their own page, and an RSS feed
- Events: upcoming and past events, event pages, "Add to calendar" files and a calendar feed people can subscribe to
- Software & Data, Teaching, Gallery (albums with a full-screen photo viewer), Join and Contact (with a map)

The header has a Home link, dropdown groups for less-used pages, site-wide search (Ctrl+K, Cmd+K or `/`) and a light/dark/system switch. Lab members' names are bolded and linked in every author list. Each page is built as its own HTML file with its own title, description and social-preview tags, and the build writes `sitemap.xml` and `robots.txt`.

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
| `content/slides.yml` | Home page slider: images, videos or YouTube/Vimeo embeds. |
| `content/gallery.yml` | Photo albums. |
| `content/resources.yml` | Software and datasets. |
| `content/teaching.yml`, `content/join.yml`, `content/funders.yml` | Courses, open positions, funder logos. |

Each YAML file starts with a comment listing its fields. Some things to know:

- Images and files go in `public/uploads/` and are referenced as `/uploads/name.jpg`. Full URLs also work. People without a photo get their initials.
- Markdown is supported in bios, project descriptions, news posts and event pages: headings, lists, links, images, tables. Links to `/publications#<paper id>` jump to one paper.
- People and projects are sorted by `order` (lower first), then by name or title.
- Add `aliases` to a person (e.g. `A. Rivera`) so shortened names in author lists are still recognized.
- Link a paper to a project by listing the project's file name in the paper's `projects`.
- Set `featured: true` on a paper to show it on the home page.
- Give a person a `management` title (e.g. `Lab Manager`) to list them in the management team. Mark a person `alumni: true` and add `now` to move them to Alumni.

### Importing publications

Papers come from three places, combined into one list. If a paper appears twice (same DOI or same title), the first source wins:

1. `content/publications.yml`, entered by hand
2. BibTeX files in `content/`, listed in `publications.import.bibtex`. Standard fields are read as usual; a few extra ones are understood too: `code`, `data`, `slides`, `video`, `poster`, `project` and `pdf` become links, `featured = {true}` shows the paper on the home page, `award` adds a label, and `projects` links it to research projects.
3. ORCID: put ORCID iDs in `publications.import.orcid`, e.g. `['0000-0002-1825-0097']`. Public works are fetched at build time; no API key is needed. If ORCID can't be reached, the build continues without those papers and prints a warning. Pushes to `main` rebuild the site, so new ORCID works show up with the next push, or with a manual run of the deploy workflow.

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
| Home | `home` (slider timing, intro, section titles, item counts, "All …" link text) | `slider`, `intro`, `news`, `events`, `research`, `publications`, `funders` |
| Research | `research` (title, intro, headings, tags) | `current`, `past` |
| Project page | `research.project` | `description`, `funding`, `links`, `people`, `publications` |
| People | `people` (groups, management team, alumni heading, photos, author highlighting) | `members`, `alumni` |
| Person page | `people.profile` | `links`, `bio`, `interests`, `education`, `projects`, `publications` |
| Publications | `publications` (Scholar link, import, type labels, grouping, count, BibTeX, abstracts, download) | `filters`: `search`, `type`, `year`, `author`, `tag` |
| News | `news` (title, intro, group by year, RSS, "Read more" text) | |
| Events | `events` (title, intro, headings, time zone, subscribe link) | `upcoming`, `past` |
| Software & Data | `resources` (title, intro, headings) | `software`, `dataset`, `other` |
| Teaching | `teaching` (instructor and description on or off) | |
| Gallery | `gallery` (title, intro) | |
| Join | `join` (title, headings, closed positions) | `intro`, `positions`, `apply` |
| Contact | `contact` (details, map) | `email`, `phone`, `address`, `directions`, `map` |
| Footer | `footer` (on or off, text, links) | `copyright`, `institution`, `social` |

Site-wide: `name`, `tagline`, `description`, `institution`, `url` (sitemap, RSS and canonical links), `ogImage` (social previews), `favicon`, `locale` (date format), `theme` (accent colors, font, default light/dark mode) and `analytics`.

### Feeds and calendars

- News RSS is at `/news.xml` when `news.rss` is on and `url` is set. The News page links to it.
- `/events.ics` is a calendar feed with every event; the Events page offers a "Subscribe" link, so calendar apps pick up new events automatically. Each event also has its own `.ics` file behind "Add to calendar". Set `events.timezone` to the time zone your event times are written in.

### Analytics

Fill in one option under `analytics` in `site.js`: Plausible (`domain`), Umami (`websiteId`) or Google Analytics (`googleAnalytics: 'G-…'`). Plausible and Umami don't use cookies, so they don't need a consent banner in most places. All three count page changes inside the site automatically.

### Adding a page

Create a component in `src/pages/`, register it in the `PAGES` map in `src/App.jsx`, and add it to `nav` in `site.js`. Styling uses Tailwind utility classes; the accent color is available as `text-accent`, `bg-accent` and so on, and global styles are in `src/index.css`.

## Deploying

The site builds to static files and works on any static host.

URLs are plain paths such as `/people/alex-rivera`. The build writes an HTML file for every page (`people/alex-rivera.html`, `people.html` and so on), which GitHub Pages, Netlify and Cloudflare Pages serve at the extensionless URL with a 200 status. Any other URL gets `404.html`, which shows the site's "Page not found" view. On a host that doesn't resolve `.html` extensions, configure a fallback to `index.html`, or set `router: 'hash'` in `site.js` to use `/#/people` URLs instead.

The page head (title, description, colors, default theme, analytics) is generated from `site.js` by `scripts/site-plugin.js`; content is read by `scripts/content.js`. Restart `npm run dev` after changing `site.js`.

If the site is served from a subpath, build with `BASE_PATH`, e.g. `BASE_PATH=/academic-lab/ npm run build`. The GitHub Pages workflow sets it for you.

### GitHub Pages

`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`, including commits made from `/admin`. In the repository settings, set Pages > Source to "GitHub Actions".

To use a custom domain, set it under Settings > Pages and put the same address in `site.url` and in `site_url` in `public/admin/config.yml`.
