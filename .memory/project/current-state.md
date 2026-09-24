# Current State

Last updated: 2026-09-24
Rewritten in place, not appended to — see `docs/memory-architecture.md` for why.

## Shipped

- Sort (title/date/rating) and genre filter — Lesson 2
- Watched-status: `watched` boolean field, eye icon on watchlist cards, persists in localStorage — Lesson 3 Activation Exercise
- Watched-status filter dropdown on the watchlist page (`watchlist.html:48`, `src/watchlist.js:217`) — commit `fcc3eca`

## Deliberately absent, not a gap

- No eye icon on search-result cards. Deferred because adding it raises an unresolved question (see below), not because it was forgotten.

## Open question — blocks related work

- Can a movie be marked watched without being on the watchlist?
  - If **no**: the eye icon has no reason to appear on search-result cards at all.
  - If **yes**: watched status needs a second, separate list in localStorage, which reopens the field-vs-array question `decisions/decision-001.md` settled.
  - Unresolved. Answer this before adding the search-result eye icon.

## Known limitation, accepted

- None currently beyond the open question above.

## Superseded by this entry

- `docs/continuity-notes.md` (2026-09-21, Activation Exercise notes) lists "add watched-status filter" as remaining work — that shipped. That file is a dated historical snapshot of the Activation Exercise and is left as-is; this entry is the current source of truth for project state.
