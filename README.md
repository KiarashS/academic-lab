# Academic lab website

A minimal website for a research group, built with React, React Router, Vite and Tailwind CSS v4. All content lives in plain JavaScript files, so updating the site means editing data, not components.

## Pages

- Home: an image/video slider, tagline, intro, latest news, current projects and featured publications
- Research: current and past projects, each with a detail page listing its people and papers
- People: members grouped by role, an optional management team, alumni with where they went, and a profile page per person with their projects and publications
- Publications: search, filters by type, year and tag (kept in the URL so a filtered view can be shared), abstracts, BibTeX generated from each entry with a copy button, and a download of the whole (or filtered) list as a `.bib` file. `/publications#<id>` links to a single paper and highlights it.
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

| What | Where |
| --- | --- |
| Lab name, tagline, institution, logo, favicon | `src/config/site.js` |
| Public URL (sitemap, canonical links), social-preview image, date locale | `site.url`, `site.ogImage`, `site.locale` |
| Accent colors, font, default theme | `site.theme` |
| Which pages exist and their order in the menu | `site.nav` (remove an entry to remove the page) |
| Home page slider (on/off, autoplay, speed, shape) | `site.home.slider`; slides in `src/content/slides.js` |
| Home page sections and their order | `site.home.sections` |
| People groups and their order | `site.people.groups` |
| Management team (on/off, title, position) | `site.people.management` |
| Contact page map | `site.contact.map` |
| Publication type labels | `site.publications.types` |
| Footer links | `site.social` |
| Content | `src/content/*.js` |

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
