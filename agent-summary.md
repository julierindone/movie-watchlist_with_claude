# Repo Structure Summary

**Project:** `movie-watchlist_with_claude` — a client-side movie search & watchlist app built against the OMDb API.

## Stack
- Vanilla JS (no framework), bundled/served with **Vite**
- **Vitest** (+ `@vitest/coverage-v8`) for testing, with test files colocated next to their source (`fileName.test.js` beside `fileName.js`)
- Plain CSS (no preprocessor), `vanilla-tilt` for card hover effects
- Movie data from the OMDb API (key read from `VITE_OMDB_API_KEY` env var in `.env`)

## Top-level layout
- `index.html` — search page (entry point)
- `watchlist.html` — saved watchlist page
- `index.js` — app bootstrap; wires up DOM listeners (search submit, watchlist/watched icon clicks, notes, tags, user-rating dropdowns, expand/collapse details, broken-image fallback) and initializes the localStorage-backed watchlist
- `assets/` — CSS (`style.css`, `cards.css`, `reset.css`, bundled `all.css`), JS bundle (`all.js`), images, webfonts, and the `vanilla-tilt` library
- `Dockerfile`, `docker-entrypoint.sh` — containerized dev/run setup
- `settings.json`, `statusline.sh` — Claude Code status line config
- `.env` / `.env.example` — OMDb API key config
- `package.json` — `dev` (vite) and `test` (vitest) scripts; deps: `vite`, `vanilla-tilt`; devDeps: `vitest`, `@vitest/coverage-v8`
- `scripts/session-cost.mjs` — standalone script, unrelated to the app runtime
- `coverage/` — generated Vitest coverage report output

## `src/` modules
- **`fetch.js`** — talks to the OMDb API: `fetchExact` (by title), `fetchFuzzy` (search), `fetchFromImdbId` (by IMDb ID), plus `toMovieArray` to normalize single vs. list responses
- **`normalize.js`** — `createMovieObject` maps raw OMDb fields into the app's internal movie shape (title, rating, runtime, thumbnail fallback, etc.)
- **`search.js`** — drives the search page: search type selection, broken-thumbnail handling
- **`watchlist.js`** — the largest module; owns all localStorage-backed state: add/remove, watched-status toggle, notes, tags (add/remove + tag filter), user rating (1–10, sortable), sort preference, genre/watched/tag filters, and legacy-item field backfill
- **`render.js`** — builds HTML strings/DOM for search results, watchlist cards, ratings, user-rating dropdown, notes, tag chips, and error/empty states
- **`helpers.js`** — shared utilities: `resetAll`, `getSpaceSaver` (empty/error messaging), `escapeHtml` (sanitizes user-typed text before `innerHTML` use), `getStoredPreference`/`setStoredPreference`, `toggleMainSection`

Every `src/` file except `search.js` has a matching `*.test.js` file.

## Flow
1. `index.js` initializes the watchlist from localStorage and sets up event listeners.
2. On the search page, submitting the search form uses `fetch.js` to query OMDb, `normalize.js` to shape the data, and `render.js` to display cards.
3. Clicking a card's watchlist/watched icon, editing a note, adding/removing a tag, or setting a user rating all route through `watchlist.js`, which persists the change to `localStorage`.
4. `watchlist.html` reads the (optionally sorted/filtered) watchlist array and renders it via `render.js`, or shows an empty-state message via `helpers.js` if nothing is saved.

## Claude Code / agent configuration (`.claude/`)
- `agents/` — subagent definitions: `orchestrator`, `planner`, `implementer`, `reviewer`, `tester`, `researcher`, `feature-builder`, `test-writer`, `test-repair`
- `skills/` — `find-untested-functions`, `log-decision`
- `settings.json` / `settings.local.json` — permissions and tool config

## Project memory (`.memory/`)
- `SCOPE.md` — declares this directory belongs to `julierindone/movie-watchlist_with_claude`, verified against the git remote
- `project/` — read/write working memory: `MEMORY_INDEX.md` (index), `current-state.md` (shipped/deferred features, open questions), `decisions/decision-00N.md` (8 recorded decisions, e.g. boolean watched field, colocated tests, notes field, tag filtering, user-rating UI)
- `knowledge/` — read-only, human-maintained: `coding-standards.md`, `project-conventions.md`
- `reference/` — read-only pointers, indexed via `REFERENCE_INDEX.md`

## `docs/`
- `prd.md` — product requirements
- `memory-architecture.md`, `memory-directory-permissions.md` — design docs for the `.memory/` system
- `iteration-log.md`, `course-text-errata.md`, `feature-builder-quality-rubric.md`, `orchestration-diagram.md`/`.png`, `routing-and-tool-grant-map.md`/`.json` — process/course documentation
- `_Notes-context-for-claude-helping-with-class-assignments/`, `_Notes-failed-exercise-bullshit/`, `older_docs/` — course-assignment working notes and archives
