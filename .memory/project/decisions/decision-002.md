# Decision 002 - Test Files Colocated With Source

**Date:** 2026-09-23
**Review by:** 2026-12-22
**Status:** Active

**Decision:** Test files live alongside the source files they cover, as
`fileName.test.js` next to `fileName.js` in `src/`, rather than in a separate
top-level `/tests` directory.

**Rationale:** That's how our test files were organized at my last job and so I just started saving them with their files by habit and decided to keep it that way. 

**Alternatives rejected:** A separate top-level `/tests` directory mirroring the
`src/` layout.

**Current state as of 2026-09-23:** This is the layout the project already uses.
Six colocated test files in `src/`: `fetch.test.js`, `helpers.test.js`,
`normalize.test.js`, `render.test.js`, `search.test.js`, `watchlist.test.js`.

**Implementation notes:** `package.json` runs `vitest run` with no vitest or vite
config file present, so vitest's default `**/*.test.js` discovery already finds
these. The `find-untested-functions` skill pairs `fileName.js` with a sibling
`fileName.test.js`, which this layout satisfies.
