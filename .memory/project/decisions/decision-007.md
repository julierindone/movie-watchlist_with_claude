# Decision 007 - Backfill Legacy notes/tags On Load

**Date:** 2026-09-29
**Review by:** 2026-12-28
**Status:** Active

**Decision:** `initLocalStorageWatchlist()` now backfills missing
`notes`/`tags` fields onto legacy watchlist items via
`backfillLegacyWatchlistFields()` and persists the migrated array back
to localStorage immediately whenever any item was changed, rather than
relying solely on the `?? ''`/`?? []` fallbacks scattered across each
read site.

**Rationale:** Every read of `notes`/`tags` in `render.js` and
`watchlist.js` already guards with `?? ''`/`?? []`, so the app never
crashed on legacy items — but that meant every future call site had to
remember the same guard, and localStorage itself stayed permanently in
the pre-`notes`/pre-`tags` shape for any item nobody happened to edit.
Migrating on load fixes the stored data once, at the one place every
item already passes through, instead of leaving the gap open
indefinitely.

**Alternatives rejected:** Leaving the existing per-call-site `??`
fallbacks as the only defense was rejected as the status quo this
decision replaces — harmless, but it never actually closes the gap.
Normalizing in memory only, without writing back to localStorage, was
considered and rejected in favor of persisting immediately, so storage
itself is fully migrated on the very next load rather than staying
stale for items nobody touches again.

**Depends on:** `src/watchlist.test.js`'s `initLocalStorageWatchlist`
"loads an existing, valid watchlist..." test (~line 102) asserts
`watchlistArray` equals the raw stored fixture via `toEqual`, and this
migration makes that assertion fail for any fixture missing `notes`/
`tags`. The `test-repair` agent correctly left it failing as a
behavior-judgment call rather than guessing (see
`docs/Mod-2_L4-docs/test-repair-iteration-log.md`, Runs 002-003) —
whoever picks this up still needs to decide whether to update the
test's expected fixture to include the backfilled fields, or reconsider
whether load-time persistence is the right call. Not yet resolved.
