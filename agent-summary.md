# Repo Structure Summary

**Project:** `movie-watchlist_with_claude` — a client-side movie search & watchlist app built against the OMDb API.

## Stack
- Vanilla JS (no framework), bundled/served with **Vite**
- **Vitest** for testing
- Plain CSS (no preprocessor), `vanilla-tilt` for card hover effects
- Movie data from the OMDb API (key read from `VITE_OMDB_API_KEY` env var)

## Top-level layout
- `index.html` — search page (entry point)
- `watchlist.html` — saved watchlist page
- `index.js` — app bootstrap; wires up DOM listeners (search submit, watchlist icon clicks, expand/collapse details, broken-image fallback) and initializes localStorage-backed watchlist
- `assets/` — CSS (`style.css`, `cards.css`, `reset.css`, bundled `all.css`), JS bundle (`all.js`), images, webfonts, and the `vanilla-tilt` library
- `Dockerfile`, `dockerfile_orig`, `docker-entrypoint.sh` — containerized dev/run setup
- `settings.json`, `statusline.sh` — Claude Code project config (status line script)
- `.env` / `.env.example` — OMDb API key config
- `package.json` — `dev` (vite) and `test` (vitest) scripts; deps: `vite`, `vanilla-tilt`; devDep: `vitest`

## `src/` modules
- **`fetch.js`** — talks to the OMDb API: `fetchExact` (by title), `fetchFuzzy` (search), `fetchFromImdbId` (by IMDb ID), plus `toMovieArray` to normalize single vs. list responses
- **`normalize.js`** — `createMovieObject` maps raw OMDb fields into the app's internal movie shape (title, rating, runtime, thumbnail fallback, etc.); has a companion test file `normalize.test.js`
- **`search.js`** — drives the search page: runs searches, renders results, handles "more/less details" expansion and broken thumbnail images
- **`watchlist.js`** — manages the watchlist stored in `localStorage`: init, add/remove via icon click, and the in-memory `watchlistArray`
- **`render.js`** — builds HTML strings/DOM for movie cards, watchlist items, and error states (no-match, fetch failure, etc.)
- **`helpers.js`** — shared UI utilities: `resetAll`, `getSpaceSaver` (empty/error state messaging), `toggleMainSection`

## Flow
1. `index.js` initializes the watchlist from localStorage and sets up event listeners.
2. On the search page, submitting the search form calls `search.js`, which uses `fetch.js` to query OMDb, `normalize.js` to shape the data, and `render.js` to display cards.
3. Clicking a card's watchlist icon calls into `watchlist.js`, which persists the change to `localStorage`.
4. The watchlist page (`watchlist.html`) reads `watchlistArray` and renders it via `render.js`, or shows an empty-state message via `helpers.js` if nothing is saved.
