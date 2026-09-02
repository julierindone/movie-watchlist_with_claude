---
name: find-untested-functions
description: Compare each fileName.js against its fileName.test.js to identify functions that vitest has no test for yet. Use when checking test coverage gaps before writing new vitest tests, or as a step in an agent that generates tests for new/changed functions.
---

For each source file (e.g. `src/foo.js`), find its paired test file (`src/foo.test.js`, same directory/basename) and report which functions in the source file are not yet covered by that test file.

## Steps

1. **Locate the pair.** Test file is the source file's basename with `.test.js` appended (`watchlist.js` -> `watchlist.test.js`). If the test file does not exist, sort all its functions into the appropriate bucket.

2. **Extract candidate functions from the source file.** Read the file and collect top-level function names from these forms:
   - `function name(...)` / `async function name(...)`
   - `export function name(...)` / `export async function name(...)`
   - `const name = (...) => ...` / `const name = async (...) => ...` (top-level only, not inline callbacks passed as arguments)

   For each, note whether it's exported. Only exported functions can be imported directly into a test file — non-exported ones can only be exercised indirectly through an exported function that calls them.

3. **Read the test file** and check, for each candidate function name, whether it's:
   - imported by name from the source file's import statement, AND
   - referenced somewhere in the test body (a `describe(...)` block named after it and/or a direct call in an `it`/`test` block).

   A non-exported function counts as tested if it's reachable from a test that exercises an exported function which calls it (e.g. `watchlist.test.js` tests `addToWatchList` indirectly via `handleWatchlistIconClick`) — treat any function name appearing in the source's call graph beneath a tested exported function as covered, not just functions imported directly.

4. **Report the results** as three buckets:
   - **Needs a test** — exported functions with no import and no reference anywhere in the test file. These are what vitest needs a new `describe`/`it` for.
   - **Covered indirectly** — non-exported functions exercised only through a tested exported function (informational, not a gap).
   - **Untestable as-is** — non-exported functions that aren't reachable from any tested exported function. Flag these separately since they can't get a direct test without exporting them first; note that to the caller rather than silently treating them as "needs a test."
   
   Note: Only the "Needs a test" bucket represents actionable work for a test-writing step — return that list (function names + line numbers), sorted by file name, as the primary output.