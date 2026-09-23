# Decision 001 - Watched Status as Item Field

**Date:** 2026-09-22
**Review by:** 2026-12-21
**Status:** Active

**Decision:** Watched status is stored as a `watched: true/false` boolean field
directly on each existing movie object, rather than in a separate watched-items
array.

**Rationale:** Keeping watched status on the movie object itself meant the
existing render, sort, and filter logic (built in Lesson 2's exercise) only ever
has to deal with one object shape — no second data structure to keep in sync, and
no risk of a movie existing in the watchlist but not in a parallel
watched-tracking list, or vice versa. It also matched how the app already models
other per-item state.

**Alternatives rejected:** A separate `watchedArray` was considered, since it
would make "show only watched movies" a simple array to iterate without a filter
check. This was ruled out because it introduces a second source of truth that has
to be kept synchronized with the main watchlist on every add/remove, for a
query-convenience benefit that a simple filter on the existing array already
provides just as easily.
