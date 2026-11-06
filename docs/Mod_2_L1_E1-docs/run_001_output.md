## Summary

**1. Ran the `find-untested-functions` skill logic** across every `src/*.js` / `*.test.js` pair:

| Source file | Result |
|---|---|
| `fetch.js` | All 4 exported functions (`fetchExact`, `fetchFuzzy`, `fetchFromImdbId`, `toMovieArray`) already covered in `fetch.test.js` |
| `normalize.js` | `createMovieObject` already covered in `normalize.test.js` (with `getThumbnail`/`getRating` covered indirectly) |
| `render.js` | All 7 exported functions already covered in `render.test.js` |
| `search.js` | All 5 exported functions already covered in `search.test.js` |
| `watchlist.js` | All 4 exported members (`watchlistArray`, `initLocalStorageWatchlist`, `onWatchlist`, `handleWatchlistIconClick`) already covered in `watchlist.test.js` |
| **`helpers.js`** | **No paired test file exists at all.** Per the skill's rule ("if the test file does not exist, sort all its functions into the appropriate bucket"), all 3 exported functions — `resetAll`, `getSpaceSaver`, `toggleMainSection` — landed in **Needs a test**. |

So the only actionable gap was `helpers.js`.

**2. Wrote `src/helpers.test.js`** (new file, following the existing mock/describe/it conventions used in `fetch.test.js`/`render.test.js`), with tests exercising real behavior against `document`/`main` DOM stubs (no mocking of the functions under test themselves):
- `resetAll`: normal reset (clears `resultsArray` + wipes `main-wrapper` markup), already-empty/no-match state, and a thrown error when `main-wrapper` is missing.
- `getSpaceSaver`: `'watchlist'` empty-state message, `'no_matches'` message, the generic failure message used for network/connection-broken states (`'error'` status), the same fallback for invalid/undefined input, and a thrown error when `main` is missing.
- `toggleMainSection`: default `'list'` layout, explicit `'space-saver'` layout, defensive handling of an unrecognized/invalid goal value, and a thrown error when `main-wrapper` is missing.

`./search.js` (which `helpers.js` imports `resultsArray` from) is mocked so no real module coupling or network paths are touched — there's no fetch/API call in `helpers.js` itself.

**3. Ran `npx vitest run`** from `/workspace/src` — it failed with a **pre-existing environment issue unrelated to any code changes**:

```
Error: Cannot find native binding ... Cannot find module '@rolldown/binding-wasm32-wasi'
```

`node_modules/@rolldown` only contains the `win32-x64-msvc` binding (no Linux binding), and this sandbox has no `npm`/network access to fetch the correct one. I confirmed this isn't something I introduced by running `npx vitest run normalize.test.js` (an untouched, previously-passing test file) — it fails with the exact same startup error, so the entire vitest/vite/rolldown toolchain is currently non-functional in this container regardless of my changes.

**Files changed:** only `src/helpers.test.js` was added. No non-test files were modified, and no other preexisting test files were touched.

**Recommendation:** the `node_modules` in this container appears to have been installed on a different OS (Windows) and mounted in; reinstalling dependencies on a Linux host (or restoring network/npm access to fetch `@rolldown/binding-linux-x64-gnu`) should let `npx vitest run` execute normally, at which point `helpers.test.js` should pass alongside the rest of the suite.
