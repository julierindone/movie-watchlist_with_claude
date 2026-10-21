# Decision 008 - User Rating Dropdown State Tracking

**Date:** 2026-10-19
**Review by:** 2027-01-17
**Status:** Active
**Updated:** 2026-10-19 — corrected a critical regression in the toggle/blur
interaction and rewrote the reselect-same-value paragraph, which previously
overstated what `blur` covers. Further corrected 2026-10-19, same day, after
manual testing: the reselect-same-value paragraph below had retracted an
earlier claim that `blur` covers that case, asserting instead that no native
`<select>` event fires on an unchanged-value reselect and that this was an
accepted limitation. Manual testing in Brave and Firefox on 2026-10-19
confirmed that assumption was also wrong — the dropdown does correctly close
on a same-value reselect, via the existing capturing `blur` listener. Native
`<select>` focus/blur behavior around an open native popup is apparently less
consistent across browsers/engines than either prior version of this entry
assumed. There is no accepted limitation here; no code change was needed.

**Decision:** The user-rating feature (`userRating`, integer 1-10 or `null`,
field on the movie object) tracks which rating dropdown is open purely via the
DOM's native `hidden` attribute on each `#rating-select-{imdbID}` `<select>` —
there is no JS variable holding "the currently open imdbID." Opening one
dropdown (`handleUserRatingToggleClick` in `index.js`) first hides every other
`.rating-select` that isn't already hidden, then toggles its own, via a shared
`hideOpenRatingSelects(shouldStayOpen)` helper that takes a predicate (used
with an identity check from the toggle, and a `.ratings`-containment check
from the generic click listener below). The delegated `click` listener on
`document` additionally closes any `.rating-select` that is open but whose own
`.ratings` ancestor did not contain the click target, covering both true
outside clicks and clicks landing inside a different movie's card. A native
`<select>` was used for the dropdown itself (not a custom popup/listbox),
matching the existing sort/genre/tag filter pattern in this codebase and
giving keyboard accessibility for free.

Closing on selection also needed two more listeners, added 2026-10-19 after
review: the delegated `change` listener sets `hidden = true` on the select
itself immediately (not waiting on `renderHtml()`'s rebuild), and a capturing
`blur` listener on `document` (capturing because `blur` doesn't bubble) hides
any `.rating-select` that loses focus — except when focus is moving to that
select's own `.user-rating-toggle` button (checked via `event.relatedTarget`),
in which case the blur listener returns without touching `hidden` and lets
`handleUserRatingToggleClick` decide the outcome instead. That exception was
added 2026-10-19 after a second review found a critical regression: without
it, re-clicking a toggle to close its own open select instead reopened it
every time, because `mousedown` moves focus off the select before the `click`
handler runs, so the blur listener's unconditional hide ran first and
corrupted the toggle handler's `wasOpen` snapshot (it always read `false`).

Reselecting a `<select>`'s already-current value was theorized to fire neither
`change` nor `blur` — the assumption being that focus never leaves the select
for that interaction, leaving no DOM event this code could hook to close the
dropdown at the moment of an unchanged-value reselect. An earlier version of
this entry treated that as an accepted limitation of native `<select>`
elements. That assumption was incorrect: manual testing in Brave and Firefox
on 2026-10-19 confirmed the dropdown does correctly close on a same-value
reselect, handled by the existing capturing `blur` listener described above —
`blur` does fire in practice for that interaction in both engines tested. No
accepted limitation exists here and no code change was made. (A still-earlier
version of this entry had also incorrectly claimed `blur` covered this case,
but for different, unverified reasoning; that claim was retracted earlier
2026-10-19 before this correction confirmed `blur` does in fact cover it.)

**Rationale:** Every other piece of per-item state in this app (notes, tags,
watched) already lives on the movie object and is re-derived from the DOM/array
on each render rather than tracked in a separate "UI state" variable; this
keeps the rating dropdown consistent with that stateless-UI pattern instead of
introducing the first piece of transient JS state this file has needed.
Checking `.closest('.ratings').contains(event.target)` per open select (rather
than a single `!event.target.closest('.ratings')` check) was necessary because
with multiple movies on the page, a click inside movie A's `.ratings` container
must still close movie B's open dropdown — a single ratings-ancestor check
would have incorrectly left B's dropdown open.

**Alternatives rejected:** A module-level `openRatingImdbID` variable in
`index.js` was considered and rejected — it would need to be manually kept in
sync with the DOM on every render (`renderHtml()` rebuilds `#main-wrapper`
entirely, including all `.rating-select` elements), which is strictly more to
get wrong than querying `hidden` directly off the live DOM.

**Depends on:** `generateUserRatingHtml()` in `src/render.js` must keep
rendering the `<select>` with the `hidden` attribute present by default on
every render, since the re-render after an actual rating change produces a
brand-new select element that must start hidden — the explicit `hidden = true`
set in the `change` listener only hides the old element for the moment before
`renderHtml()` replaces it. The select also carries an `aria-label` built from
`movie.title`, left unescaped like every other `movie.title` interpolation in
`src/render.js` (API-sourced, not user-typed — see decision-005).
