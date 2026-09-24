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

**Depends on:** `package.json` runs `vitest run` with no vitest/vite config
file present, so this layout relies on vitest's default `**/*.test.js`
discovery. If a config file is ever added, check it doesn't narrow that
pattern. The `find-untested-functions` skill also assumes this pairing.
