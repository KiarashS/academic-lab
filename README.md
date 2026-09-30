# Academic lab website

A minimal website for a research group, built with React, React Router, Vite and Tailwind CSS v4. All content lives in plain JavaScript files, so updating the site means editing data, not components.

## Pages

- Home: tagline, intro, latest news, current projects and featured publications
- Research: current and past projects, each with a detail page listing its people and papers
- People: members grouped by role, alumni with where they went, and a profile page per person with their projects and publications
- Publications: search, filters by type, year and tag (kept in the URL so a filtered view can be shared), abstracts, and BibTeX generated from each entry with a copy button
- News, Teaching, Join (open positions) and Contact (address, optional map)
- 404 page

Lab members' names are bolded and linked in every author list. The site has a light/dark/system theme toggle, a mobile menu, per-page titles, and a skip-to-content link.

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
| Lab name, tagline, institution, logo | `src/config/site.js` |
| Accent colors, font, default theme | `site.theme` |
| Which pages exist and their order in the menu | `site.nav` (remove an entry to remove the page) |
| Home page sections and their order | `site.home.sections` |
| People groups and their order | `site.people.groups` |
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

To add a new page, create a component in `src/pages/`, register it in the `PAGES` map in `src/App.jsx`, and add it to `site.nav`.

Styling uses Tailwind utility classes directly in the components. The accent color is available as `text-accent`, `bg-accent` and so on; global styles are in `src/index.css`.

## Deploying

The site builds to static files and works on any static host.

By default it uses hash URLs (`/#/people`), which need no server configuration. For clean URLs, set `router: 'browser'` in `site.js`, build with `BASE_PATH` set to the path the site is served from (e.g. `BASE_PATH=/ npm run build`), and configure the host to serve `index.html` for unknown paths.

### GitHub Pages

`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`. In the repository settings, set Pages > Source to "GitHub Actions".
