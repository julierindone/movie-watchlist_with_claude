 Estimate current test coverage for this project. - Run the project's test suite with coverage reporting enabled (e.g.,
   RUN  v4.1.11 /workspace
        Coverage enabled with v8

   ✓ src/normalize.test.js (2 tests) 7ms
   ✓ src/watchlist.test.js (3 tests) 11ms

   Test Files  2 passed (2)
        Tests  5 passed (5)
     Start at  23:02:37
     Duration  3.50s (transform 353ms, setup 0ms, import 1.01s, tests 18ms, environment 0ms)

   % Coverage report from v8
  --------------|---------|----------|---------|---------|------------------------
  | File           | % Stmts   | % Branch   | % Funcs   | % Lines   | Uncovered Line #s
	| -------------- | --------- | ---------- | --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | All files      | 34.73     | 57.44      | 51.72     | 31.03     |
  | fetch.js       | 4.54      | 0          | 0         | 4.54      | 7-49                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  | helpers.js     | 0         | 0          | 0         | 0         | 4-41                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
  | normalize.js   | 100       | 90.9       | 100       | 100       | 10,23                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
  | watchlist.js   | 49.01     | 50         | 61.11     | 46.66     | ...76-77,88-89,118-130                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
  | -------------- | --------- | ---------- | --------- | --------- | ------------------------). - Report the overall coverage percentage (lines, branches, functions — whatever the tool provides). - Identify ONE file with the greatest need for test coverage. - Briefly explain why that file is especially in need of test coverage (e.g., it contains complex conditional/branching logic, it handles data persistence or external API calls where silent failures are costly, it's a frequently-modified file with high risk of regressions, it's relied on by many other files, or it contains business-critical logic like watchlist state management). - Do not write or modify any test files. - Do not modify any source files. |

  Read 2 files, listed 1 directory

Coverage Summary

Overall: 34.73% statements | 57.44% branches | 51.72% functions | 31.03% lines (2 test files, 5 tests, all passing)

┌──────────────┬────────┬────────┬────────┬────────┬───────────────────────┐
│     File     │ Stmts  │ Branch │ Funcs  │ Lines  │       Uncovered       │
├──────────────┼────────┼────────┼────────┼────────┼───────────────────────┤
│ fetch.js     │ 4.54%  │ 0%     │ 0%     │ 4.54%  │ 7-49                  │
├──────────────┼────────┼────────┼────────┼────────┼───────────────────────┤
│ helpers.js   │ 0%     │ 0%     │ 0%     │ 0%     │ 4-41                  │
├──────────────┼────────┼────────┼────────┼────────┼───────────────────────┤
│ normalize.js │ 100%   │ 90.9%  │ 100%   │ 100%   │ 10, 23                │
├──────────────┼────────┼────────┼────────┼────────┼───────────────────────┤
│ watchlist.js │ 49.01% │ 50%    │ 61.11% │ 46.66% │ 76-77, 88-89, 118-130 │
└──────────────┴────────┴────────┴────────┴────────┴───────────────────────┘

Greatest need: src/watchlist.js

This is the file to prioritize, ahead of fetch.js (which has near-zero coverage but is largely a thin API wrapper) and helpers.js (zero coverage but small/simple DOM-toggle code).

Reasons:

1. It owns core business logic — the entire watchlist add/remove/persistence flow (handleWatchlistIconClick, addToWatchList, removeFromWatchlist, processWatchlistAdd, localStorage sync) lives here. This is the app's central state management, not a utility.
2. It already has documented, uncaught bugs — the file's own header comment (lines 1-3) flags two real defects: processWatchlistAdd (lines 121-131, currently uncovered) has no return in its Response === "False" branch, so movie can become undefined and crash the next line; and createMovieObject(data) is called there missing its second argument, unlike every other call site. These are exactly the kind of regressions unit tests exist to catch, and the uncovered line ranges (88-89, 118-130) line up directly with the buggy code paths.
3. It's only partially tested (49%), which is worse than it looks — the covered half is likely the simpler getters (onWatchlist, index lookups), while the riskier async/branchy logic (processWatchlistAdd, handleWatchlistIconClick) is in the uncovered remainder.
4. Silent-failure risk compounds with state persistence — bugs here don't just throw once; they get written to localStorage via setLocalStorageWatchlist(), so a bad state can persist across sessions.

By contrast, fetch.js's uncovered code is mostly thin try/catch wrappers around the native fetch call — worth testing eventually, but lower complexity and lower business risk than the watchlist state machine.
