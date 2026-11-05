# Test Coverage Estimate — Run 002

**Command:** `npx vitest run --coverage`
**Result:** 2 test files, 5 tests, all passing

```
 % Coverage report from v8
--------------|---------|----------|---------|---------|------------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------|---------|----------|---------|---------|------------------------
All files     |   34.73 |    57.44 |   51.72 |   31.03 |
 fetch.js     |    4.54 |        0 |       0 |    4.54 | 7-49
 helpers.js   |       0 |        0 |       0 |       0 | 4-41
 normalize.js |     100 |     90.9 |     100 |     100 | 10,23
 watchlist.js |   49.01 |       50 |   61.11 |   46.66 | ...76-77,88-89,118-130
--------------|---------|----------|---------|---------|------------------------
```

## Overall coverage

| Metric     | % Covered |
| ---------- | --------- |
| Statements | 34.73% (33/95) |
| Branches   | 57.44% (27/47) |
| Functions  | 51.72% (15/29) |
| Lines      | 31.03% (27/87) |

**Caveat on scope:** this table only reflects modules actually imported by the two existing test files (`src/normalize.test.js`, `src/watchlist.test.js`). `src/render.js` and `src/search.js` are never imported by any test, so v8 doesn't instrument them at all — they don't even appear as 0% rows. Effective coverage of the whole `src/` directory is lower than 34.73% suggests.

## File with the greatest need: `src/watchlist.js`

This file owns the watchlist add/remove/persistence flow (`handleWatchlistIconClick`, `addToWatchList`, `removeFromWatchlist`, `processWatchlistAdd`, and the `localStorage` sync functions) — it's the app's core state machine, not a utility module.

Why it outranks the other candidates:

1. **It has a documented, live bug in the uncovered code.** The file's own header comment flags that `processWatchlistAdd` (lines ~117-130, currently uncovered per the report) has no `return` in its `data.Response === "False"` branch — so `movie` can come back `undefined` and the very next line (`addToWatchList(movie, ...)`) will throw. A test exercising the API-failure path would catch this immediately; none currently does.
2. **It's only ~49% covered, and the untested half is the risky half.** The uncovered ranges (76-77, 88-89, 118-130) line up with the async fetch-then-mutate logic and the failure branch, not with the simple lookups (`onWatchlist`, index getters) that are already tested.
3. **It's business-critical state, not a display helper.** Bugs here don't just affect one render — they get written to `localStorage` via `setLocalStorageWatchlist()`, so a bad state (e.g. a corrupted or `undefined` movie object) can persist across sessions and corrupt the user's actual watchlist.
4. **It integrates several modules** (`search.js`, `render.js`, `normalize.js`, `fetch.js`), so a regression here has a wide blast radius across the app's primary user flow (add/remove from watchlist).

By comparison, `fetch.js` (4.54%) is mostly thin try/catch wrappers around the native `fetch` call, and `helpers.js` (0%) is small DOM-toggle/reset logic — both worth covering eventually, but lower complexity and lower business risk than the watchlist state machine.
