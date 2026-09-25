# Decision 003 - Notes On Every Watchlist Item

**Date:** 2026-09-25
**Review by:** 2026-12-24
**Status:** Active

**Decision:** Personal notes are a free-text `notes` string field on every
watchlist item object, and the note UI renders on every watchlist card —
not only on items marked watched.

**Rationale:** The note's job is to record *why a movie went on the list* —
an actor worth watching, a friend's recommendation, having read the book it's
based on — which is information you have when you add it and have forgotten
by the time you come back to the list. That purpose is pre-watch, so gating
the field on `watched === true` would hide each note during the exact window
it's meant to serve, and would make a note written before watching disappear
until the movie was marked watched.

**Alternatives rejected:** Restricting notes to watched items only — the
original Module 1 framing of this feature ("add a field to watched items") —
was ruled out once the actual use case turned out to be pre-watch context
rather than post-watch reaction. A middle option, rendering the field on all
cards but auto-expanding it only on watched ones, was also rejected: it adds
UI states to get right without serving that use case any better.

**Depends on:** Follows the per-item-field pattern from
`decisions/decision-001.md`, generalized in `knowledge/project-conventions.md`
("per-item state is a field, not a parallel array") — `notes` is a string
rather than a boolean, but lives on the item object for the same reason.
Watchlist items already in localStorage predate this field, so a missing
`notes` must read as empty rather than `undefined`.
