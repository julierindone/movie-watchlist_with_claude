# Decision 006 - Tags: Chip Entry, Single-Select AND Filter

**Date:** 2026-09-29
**Review by:** 2026-12-28
**Status:** Active

**Decision:** Tags are entered as removable chips (not a single
comma-separated text field) and filtered through one single-select
dropdown that AND-chains into `getFilteredWatchlistArray()` alongside
the existing genre and watched-status filters, rather than a
multi-select with its own AND/OR semantics.

**Rationale:** Chips give each tag its own add/remove control instead
of requiring the user to retype a whole list to remove one entry, at
the cost of more UI state than a single input would need. AND-chaining
a single-select tag filter into the same sequential `.filter()`
pipeline genre and watched-status already use keeps all three filters
behaving identically — each narrows the list further, none combine
with OR — so a future filter addition can follow the same pattern
without inventing a new combination rule.

**Alternatives rejected:** A single comma-separated text input was
considered, closer in effort to the existing `notes` field, but
rejected because removing one tag would require retyping the rest.
A multi-select tag filter (choosing several tags at once) was rejected
because it has no existing precedent in this codebase and would force
an AND-vs-OR decision among selected tags with no clear default,
versus the single-select's unambiguous "one active tag at a time."

**Depends on:** Legacy watchlist items with no `tags` field read as
`movie.tags ?? []` everywhere (matching the existing `notes ?? ''`
pattern). `decision-007` covers a separate, later change that also
backfills this field at load time.
