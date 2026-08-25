# Test Coverage Report

_Generated 2026-08-24 via `npx vitest run --coverage` (v8 coverage provider, vitest v4.1.11)._

## Overall Coverage

| Metric | Coverage |
|---|---|
| Statements | 34.73% (33/95) |
| Branches | 57.44% (27/47) |
| Functions | 51.72% (15/29) |
| Lines | 31.03% (27/87) |

Only 2 test files exist (`src/normalize.test.js`, `src/watchlist.test.js`), covering 5 tests total.

### Per-file breakdown

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
|---|---|---|---|---|---|
| `src/fetch.js` | 4.54 | 0 | 0 | 4.54 | 7-49 |
| `src/helpers.js` | 0 | 0 | 0 | 0 | 4-41 |
| `src/normalize.js` | 100 | 90.9 | 100 | 100 | 10, 23 |
| `src/watchlist.js` | 49.01 | 50 | 61.11 | 46.66 | 76-77, 88-89, 118-130 |

Note: `src/render.js` and `src/search.js` don't appear in the report at all, meaning they aren't exercised by any test and are effectively at 0% coverage as well — they're excluded from the summary above only because vitest's v8 provider only reports files touched during a test run.

## File Most in Need of Coverage: `src/watchlist.js`

While `helpers.js` and `fetch.js` sit at 0-4% coverage, `watchlist.js` is the higher-priority target because it is the file that owns watchlist **state management** — the app's core business logic — and it already has documented, uncovered bugs:

- It maintains `watchlistArray`, the single source of truth for what's on a user's watchlist, and mediates all reads/writes to `localStorage` (`initLocalStorageWatchlist`, `setLocalStorageWatchlist`, `resetLocalStorageWatchlist`). A silent bug here means a user's watchlist is corrupted or lost, not just a cosmetic glitch.
- It contains meaningful branching logic (add vs. remove, search-page vs. watchlist-page context, cache-hit vs. needs-fetch) that determines which of several code paths mutates state.
- The file's own top-of-file `TODO` comment flags two real defects in the currently **uncovered** lines (117-130):
  - `processWatchlistAdd` has no `return` in its `data.Response === "False"` branch, so it implicitly returns `undefined`; a failed OMDb lookup then causes `addToWatchList(movie, ...)` to be called with `movie === undefined`, which will throw.
  - `createMovieObject(data)` is called without the `watchlistStatus` argument at line 126 (unlike every other call site), leaving `movie.watchlist` transiently undefined.
- These are exactly the kind of async, conditional, error-handling bugs that tests catch cheaply and that manual QA tends to miss.

By contrast, `fetch.js` and `helpers.js` are thinner (mostly fetch wrappers and DOM string templating) and lower-risk if broken, even though their percentage coverage is numerically lower.

## Recommendation

Prioritize tests for `src/watchlist.js`, specifically:
1. `processWatchlistAdd` on both the success and `Response === "False"` paths (this would surface the missing-`return` bug directly).
2. `handleWatchlistIconClick` add/remove branches, including the "watchlist page" vs. "search page" DOM context.
3. `initLocalStorageWatchlist` for the null, valid-JSON, and corrupted-JSON cases.
