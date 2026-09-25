# Project Memory Index

Last updated: 2026-09-25
Maintained by: Julie Rindone

## Active entries

- `current-state.md` — What's shipped, what's deliberately deferred, and the one open question blocking related work. Rewritten in place as state changes — no review date, check it every session.

- `decisions/decision-001.md` — Records the decision to store watched status as a boolean field on each movie object rather than in a separate watched-items array. Recorded 2026-09-22. Review by 2026-12-21.

- `decisions/decision-002.md` — Records the decision to colocate test files with the source files they cover (`fileName.test.js` next to `fileName.js` in `src/`) rather than in a separate `/tests` directory. Recorded 2026-09-23. Review by 2026-12-22.

- `decisions/decision-003.md` — Records the decision to give every watchlist item a free-text `notes` field, rendered on all watchlist cards rather than only on watched ones. Recorded 2026-09-25. Review by 2026-12-24.

- `decisions/decision-004.md` — Records the decision to persist a note on blur via a delegated `focusout` listener (not `blur`, which does not bubble), with no re-render after saving. Recorded 2026-09-25. Review by 2026-12-24.

- `decisions/decision-005.md` — Records the decision to escape user-typed text through `escapeHtml()` in `src/helpers.js` before any `innerHTML` interpolation, while API-sourced fields stay unescaped. Recorded 2026-09-25. Review by 2026-12-24.

- `../knowledge/coding-standards.md` — Coding standards for this project. Human-maintained, read-only. Last reviewed 2026-09-23.

- `../knowledge/project-conventions.md` — Architectural conventions (boolean-field-not-array, vanilla JS only, CSS consent rule, test-writer reminder). Human-maintained, read-only. Last reviewed 2026-09-24.

## Archived entries

(none yet)

## Pruning schedule

- Workflow-scoped entries: archived when the branch merges to main
- Project-scoped entries: reviewed every 90 days
