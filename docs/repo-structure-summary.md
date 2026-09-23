# Repo Structure Summary

**Project:** `movie-watchlist_with_claude` — a client-side movie search & watchlist app
built against the OMDb API, developed inside a containerized Claude Code setup.

_Last updated: 2026-09-23_

## Stack
- Vanilla JS ES modules (no framework), served/bundled with **Vite** (`vite` is a
  runtime dependency, not a devDependency; no `vite.config.*` file — defaults only)
- **Vitest** for testing (`vitest` + `@vitest/coverage-v8`; no `vitest.config.*`, so
  default `**/*.test.js` discovery applies)
- Plain CSS, Font Awesome 7.1.0 (vendored), `vanilla-tilt` for card hover effects
- Movie data from the OMDb API; key read from `VITE_OMDB_API_KEY` via `import.meta.env`
- `package.json` scripts: `dev` (vite), `test` (vitest run). `"type": "commonjs"`,
  but all source is ESM and loaded through Vite / Vitest.

## Top-level layout
- `index.html` — search page (`body#search-page`): search form, exact/fuzzy radio
  toggle, `#main-wrapper` render target
- `watchlist.html` — watchlist page (`body#watchlist-page`): sort select, genre
  filter select (options built at runtime), watched-status filter select
- `index.js` — shared bootstrap for both pages. Initializes the localStorage
  watchlist, restores saved genre/watched/sort choices on the watchlist page, and
  installs one delegated `click` listener plus form/select/`error` listeners.
- `src/` — application modules and their colocated tests (see below)
- `assets/`
  - `css/` — `all.css` (Font Awesome), `style.css`, `cards.css`, `reset.css` (currently empty)
  - `images/` — `film_icon.png` (poster fallback), `vista_lapl_coll.jpg`
  - `webfonts/` — Font Awesome `.woff2` faces
  - `all.js` — Font Awesome JS bundle; `vanilla-tilt.js` — tilt library
- `docs/` — this file, `memory-architecture.md`, `memory-directory-permissions.md`,
  and `Mod-2_L3-docs/` (course notes)
- `.memory/` — agent memory store (see below)
- `.claude/` — `agents/` (`feature-builder`, `test-writer`), `skills/find-untested-functions`,
  `settings.json` (allows `npx vitest run` + `Write`; denies edits to the read-only
  memory layers), and git-ignored `settings.local.json`
- `scripts/session-cost.mjs` — computes token usage and $ cost for a Claude Code
  session or subagent transcript
- `Dockerfile`, `docker-entrypoint.sh`, `.dockerignore` — Node 24 dev container with
  Claude Code preinstalled; entrypoint persists credentials across runs
- `settings.json`, `statusline.sh` — Claude Code status-line config copied into the image
- `.env` / `.env.example` — OMDb API key config (`.env` git-ignored)

## `src/` modules
- **`fetch.js`** — OMDb calls: `fetchExact` (by title), `fetchFuzzy` (search),
  `fetchFromImdbId` (by IMDb ID), plus `toMovieArray` to normalize single vs. list
  responses. Each throws `Fetch failed: <status>` on a non-OK response.
- **`normalize.js`** — `createMovieObject` maps raw OMDb fields to the internal movie
  shape (`title`, `imdbID`, `rating` from Rotten Tomatoes, `runtime`, `year`, `genre`,
  `plot`, `thumbnail` with `film_icon.png` fallback, `alt`, `watchlist`, `watched`)
- **`search.js`** — search-page driver. Holds module state (`resultsArray`,
  `movieDetails`, `searchType` + `setSearchType`), runs `searchMovies`, and handles
  `handleMoreDetailsClick` / `handleLessDetailsClick` / `handleImageError`.
- **`watchlist.js`** — watchlist state and persistence: `watchlistArray`,
  `initLocalStorageWatchlist`, `handleWatchlistIconClick`, `handleWatchedIconClick`,
  `onWatchlist`, sorting (`handleSortChange` by title/year/rating),
  genre + watched filtering (`getFilteredWatchlistArray`, `populateGenreFilterOptions`),
  and the three localStorage preference keys (`watchlistSort`, `watchlistGenreFilter`,
  `watchlistWatchedFilter`)
- **`render.js`** — builds card markup: `generateExactResultHtml`,
  `generateFuzzyResultsHtml`, `generateWatchlistHtml`, the `renderHtml` dispatcher
  (routes on `searchType`), and the details/error renderers. Re-applies `vanilla-tilt`
  after each render.
- **`helpers.js`** — shared utilities: `resetAll`, `getSpaceSaver` (empty-watchlist,
  `no_matches`, `no_filter_matches`, and generic error states), `toggleMainSection`,
  and the `getStoredPreference` / `setStoredPreference` localStorage wrappers

### Tests
Six colocated Vitest files (per decision-002), roughly 130 cases:
`fetch.test.js`, `helpers.test.js`, `normalize.test.js`, `render.test.js`,
`search.test.js`, `watchlist.test.js`.

## `.memory/` layers
Configured by `CLAUDE.md`; architecture and permission enforcement are documented in
`docs/memory-architecture.md` and `docs/memory-directory-permissions.md`.
- `SCOPE.md` — scope declaration, verified against the git remote on startup
- `project/` — agent-writable; `MEMORY_INDEX.md` plus `decisions/` (001: watched status
  stored as a field on each movie object; 002: tests colocated with source)
- `knowledge/` — human-maintained, read-only; `coding-standards.md`
- `reference/` — human-maintained, read-only; currently empty

## Flow
1. `index.js` initializes the watchlist from localStorage and wires up listeners on
   whichever page is loaded.
2. Submitting the search form calls `searchMovies` in `search.js`, which uses
   `fetch.js` to query OMDb, `normalize.js` to shape each result, and `render.js` to
   draw exact or fuzzy cards.
3. On fuzzy results, "more" fetches full details by IMDb ID and expands the card;
   "less" collapses it. Broken posters fall back to `film_icon.png`.
4. Clicking a card's watchlist icon calls `handleWatchlistIconClick` in `watchlist.js`,
   which fetches full details if missing, updates `watchlistArray`, persists to
   localStorage, and refreshes the genre options.
5. The watchlist page renders `watchlistArray` through `render.js`, or shows an
   empty-state message via `helpers.js` when nothing is saved.
6. Sorting (title A–Z, year newest-first, rating highest-first) and the genre and
   watched-status filters each persist to localStorage and re-render via `renderHtml()`.
   Genre and watched filters combine in `getFilteredWatchlistArray()`; when the
   combination matches nothing, the `no_filter_matches` space-saver is shown.
7. Each watchlist item carries a `watched` flag, shown as an eye icon (solid when
   watched, outline when not) that toggles via `handleWatchedIconClick`.
