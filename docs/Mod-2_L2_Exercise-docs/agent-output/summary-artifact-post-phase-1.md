# Watchlist Sorting — Phase 1 Summary

## What changed

### `watchlist.html`
Added a "Sort by" `<select>` control to the header, next to the page
title. Options: Title (A–Z), Year (Newest–Oldest), Rating
(Highest–Lowest). Uses a `<label>`/`<select>` pair to match the
accessible-form-control style already used for the search-type radio
buttons on `index.html`.

### `src/watchlist.js`
Added the sorting logic, kept as small single-purpose functions:
- `handleSortChange(sortType)` — exported entry point; sorts the array
  then re-renders via the existing `renderHtml()` flow.
- `sortWatchlistArray(sortType)` — picks the right comparator and
  mutates `watchlistArray` in place with `Array.sort`.
- `compareByTitle`, `compareByYear`, `compareByRating` — one
  comparator per sort field.
- `getYearValue`, `getRatingValue` — parse the stored strings (e.g.
  `"1994"`, `"85%"`) into numbers for comparison; missing/unparsable
  values sort to the end.

Sorting reuses the existing `renderHtml()` function (already imported
in this file) so the re-render behaves exactly like it does after
adding/removing a watchlist item — no new rendering path was needed.

### `index.js`
- Imported `handleSortChange` from `watchlist.js`.
- Added a `sortSelect` element reference.
- On watchlist-page load, if the watchlist isn't empty, it now sorts
  by the dropdown's current (default) value before rendering, so the
  visible list order always matches what the dropdown shows.
- Added a `change` listener on `sortSelect` that calls
  `handleSortChange` with the selected value, following the same
  `if (element) { element.addEventListener(...) }` pattern already
  used for `searchBar` and `searchForm`.
- Removed the now-unused `generateWatchlistHtml` import (replaced by
  the `handleSortChange` call, which renders internally).

## Why this approach
- Sorting logic lives entirely in `watchlist.js`, per the request, and
  is broken into small functions that each do one job (pick
  comparator / compare one field / parse one value).
- The UI control mirrors the existing radio-button convention's
  intent (a labeled, mutually-exclusive choice) but uses a `<select>`
  since three sort options fit better as a dropdown than as three
  separate radio rows in the header.
- Re-used the existing `renderHtml()` re-render path instead of
  building a new one, keeping behavior consistent with how the list
  already refreshes after watchlist add/remove actions.

## Notes / scope boundary
- Per discussion, `watchlist.html` and `watchlist.js` were confirmed
  as in-scope for this task (an omission in the original agent
  definition, corrected by the requester).
- This is Phase 1 only: sort control + logic. No persistence of the
  chosen sort option across page loads, and no CSS changes (styling
  left for the human developer).
