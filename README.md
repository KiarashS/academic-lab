# Academic lab website

A minimal website for a research group, built with React, React Router, Vite and Tailwind CSS v4. All content lives in plain JavaScript files, so updating the site means editing data, not components.

## Pages

- Home: an image/video slider, tagline, intro, latest news, current projects and featured publications
- Research: current and past projects, each with a detail page listing its people and papers
- People: members grouped by role, an optional management team, alumni with where they went, and a profile page per person with their projects and publications
- Publications: search, filters by type, year, author and tag (kept in the URL so a filtered view can be shared), abstracts, BibTeX generated from each entry with a copy button, and a download of the whole (or filtered) list as a `.bib` file. `/publications#<id>` links to a single paper and highlights it.
- News, Teaching, Join (open positions) and Contact (address and a map)
- 404 page

Lab members' names are bolded and linked in every author list. The site has a light/dark/system theme toggle, a mobile menu and a skip-to-content link. Each page is built as its own HTML file with its own title, description and social-preview tags, and the build writes `sitemap.xml` and `robots.txt`.

## Getting started

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve dist/ locally
```

## Customizing

All settings are in `src/config/site.js`, and all content is in `src/content/*.js`. Settings you delete from `site.js` fall back to `src/config/defaults.js`, so removing one never breaks the build.

Turning things on and off:

- Pages: remove a page from `nav` to take it off the site. Add `menu: false` to keep the page but hide its menu link. Links to a removed page disappear elsewhere too (person and project cards stop linking, "All news" links are dropped).
- Sections: each page has a `sections` list that sets which sections appear and in what order. Delete an entry to hide it; reorder entries to move it.

| Page | Settings | Sections |
| --- | --- | --- |
| Header | `header` (logo, name, theme toggle) | |
| Home | `home` (slider timing, intro text and image, section titles, how many items, "All …" link text) | `slider`, `intro`, `news`, `research`, `publications` |
| Research | `research` (title, intro, headings, tags on or off) | `current`, `past` |
| Project page | `research.project` | `description`, `funding`, `links`, `people`, `publications` |
| People | `people` (groups, management team, alumni heading, photos, author highlighting) | `members`, `alumni` |
| Person page | `people.profile` | `links`, `bio`, `interests`, `education`, `projects`, `publications` |
| Publications | `publications` (Scholar link, type labels, year grouping, count, BibTeX, abstracts, download) | `filters`: `search`, `type`, `year`, `author`, `tag` |
| News | `news` (title, intro, group by year) | |
| Teaching | `teaching` (title, intro, instructor and description on or off) | |
| Join | `join` (title, headings, show closed positions) | `intro`, `positions`, `apply` |
| Contact | `contact` (details, map) | `email`, `phone`, `address`, `directions`, `map` |
| Footer | `footer` (on or off, text, links) | `copyright`, `institution`, `social` |

Site-wide: `name`, `tagline`, `description`, `institution`, `url` (sitemap and canonical links), `ogImage` (social previews), `favicon`, `locale` (date format) and `theme` (accent colors, font, default light/dark mode).

The publications author filter lists lab members by default; set `publications.authorFilter: 'all'` to include co-authors from outside the lab. `/publications?author=<person id>` links straight to one person's papers, and each profile page links there.

Each content file starts with a comment listing the fields it accepts. Some things to know:

- Photos and images go in `public/` (e.g. `public/people/alex.jpg`) and are referenced as `people/alex.jpg`. Full URLs also work. People without a photo get their initials.
- Add `aliases` to a person (e.g. `['A. Rivera']`) so abbreviated names in author lists are still recognized.
- Link a publication to a project by listing the project's id in the publication's `projects` array.
- Set `featured: true` on a publication to show it on the home page.
- Set `bibtex` on a publication to replace the generated entry.
- Mark a person `alumni: true` and add `now` to move them to the Alumni section.
- Give a person a `management` title (e.g. `'Lab Manager'`) to list them in the management team. People who are only on the management team can leave out `group`.
- Slides can be images, video files (mp4/webm, played muted) or YouTube/Vimeo embeds. Images advance on a timer, videos when they finish. The slider pauses on hover and has a pause button, and it doesn't autoplay for visitors who have reduced motion turned on.
- For the map, give the building's `lat` and `lng`; the page embeds Google Maps or OpenStreetMap with a pin, no API key needed. Or paste any embed URL into `embedUrl`.

To add a new page, create a component in `src/pages/`, register it in the `PAGES` map in `src/App.jsx`, and add it to `site.nav`.

Styling uses Tailwind utility classes directly in the components. The accent color is available as `text-accent`, `bg-accent` and so on; global styles are in `src/index.css`.

## Deploying

The site builds to static files and works on any static host.

URLs are plain paths such as `/people/alex-rivera`. The build writes an HTML file for every page (`people/alex-rivera.html`, `people.html` and so on), which GitHub Pages, Netlify and Cloudflare Pages serve at the extensionless URL with a 200 status. Any other URL gets `404.html`, which shows the site's "Page not found" view. On a host that doesn't resolve `.html` extensions, configure a fallback to `index.html`, or set `router: 'hash'` in `site.js` to use `/#/people` URLs instead.

The head of each page (title, description, colors, default theme) is generated from `site.js` by `scripts/site-plugin.js`. Restart `npm run dev` after changing `site.js` to see head changes locally.

If the site is served from a subpath, build with `BASE_PATH`, e.g. `BASE_PATH=/academic-lab/ npm run build`. The GitHub Pages workflow sets it for you.

### GitHub Pages

`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`. In the repository settings, set Pages > Source to "GitHub Actions".

To use a custom domain, set it under Settings > Pages and put the same address in `site.url`.
