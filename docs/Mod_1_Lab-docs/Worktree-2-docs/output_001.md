# Fix Plan: Missing `return` in `processWatchlistAdd` (watchlist.js:117-128)

## Summary

`processWatchlistAdd` (src/watchlist.js:121-132) fetches full movie details from
OMDb before adding a movie to the watchlist. When the OMDb lookup fails
(`data.Response === "False"`), the function calls
`generateAddDetailsToWatchlistItemError` and logs the error, but the `if`
branch has no `return` statement, so the function falls through to the end of
the function body and implicitly returns `undefined`.

Its only caller, `handleWatchlistIconClick` (src/watchlist.js:49-70), does not
check the result — it unconditionally does:

```js
movie = await processWatchlistAdd(movie, detailsDiv);
addToWatchList(movie, detailsDiv);
```

`addToWatchList` immediately does `movie.watchlist = true`, so when `movie` is
`undefined` this throws a `TypeError: Cannot set properties of undefined`.
This happens on every failed detail lookup, not just an edge case — so it's a
live bug, not a hypothetical.

The fix has two parts: make the failure path return an explicit,
unambiguous "no movie" value, and make the caller actually check for it
before doing anything that assumes a real movie object.

## Why not just add a bare `return;`?

A bare `return;` (still evaluating to `undefined`) would silence the
"implicit return" smell but leave the actual bug in place, since the caller
still doesn't check the result before calling `addToWatchList(movie, ...)`.
The crash is in the caller, not just the missing return — so the fix has to
touch both spots or it doesn't actually fix anything.

## Plan

1. **`processWatchlistAdd` — return an explicit sentinel on failure.**
   In the `if (data.Response === "False")` branch, after the existing
   `generateAddDetailsToWatchlistItemError(...)` and `console.error(...)`
   calls, add `return null;`.
   - Using `null` (rather than a bare `return;`, which is still
     `undefined`) makes the "lookup failed, no movie object" case a
     deliberate, self-documenting signal instead of something that looks
     like a forgotten return. Anyone reading the function later can see the
     failure path is handled on purpose.

2. **`handleWatchlistIconClick` — check the result before using it.**
   After `movie = await processWatchlistAdd(movie, detailsDiv);`, add a
   guard: if `movie` is falsy (i.e. `null` from step 1), `return` immediately
   instead of proceeding to `addToWatchList`, `setLocalStorageWatchlist`, and
   `renderHtml`.
   - This is the actual crash fix — it stops `addToWatchList` from ever
     being called with a non-object.
   - Skipping `setLocalStorageWatchlist`/`renderHtml` on failure is
     intentional, not just "the easy place to put a return": watchlist state
     never changed on this path, so there's nothing new to persist or
     re-render. It also avoids a side effect: `renderHtml()` currently
     rebuilds `#main-wrapper` from `resultsArray`/`searchType`, which would
     wipe out the error message that `generateAddDetailsToWatchlistItemError`
     just wrote into `detailsDiv`. Returning early leaves that message
     visible to the user instead of silently erasing it a moment later.

## Why this won't cause new problems as the app grows

- **Single, localized point of truth for the failure state.** The contract
  becomes "`processWatchlistAdd` returns a movie object or `null`," checked
  in exactly one place (its one caller). No defensive null-checks are added
  elsewhere (e.g. inside `addToWatchList`) — that would just duplicate the
  check and give future readers two places to keep in sync instead of one.
- **No behavior change on the success path.** The `else` branch of
  `processWatchlistAdd` (`return createMovieObject(data);`) and the rest of
  `handleWatchlistIconClick` are untouched, so working watchlist-add flows
  are unaffected.
- **Fails closed, not open.** On a failed lookup, the movie is simply not
  added to the watchlist and no crash occurs — it does not get added in a
  half-populated/corrupt state that would need cleanup later.
- **Matches the existing error-reporting pattern.** The fix doesn't
  introduce a new error-handling mechanism (no new exceptions, no new
  globals) — it just makes sure the existing
  `generateAddDetailsToWatchlistItemError` UI feedback is the last word for
  that interaction, consistent with how `fetchFromImdbId`'s own catch block
  already reports fetch-level failures the same way.
- **Small enough surface area to extend safely later.** If future work adds
  retry logic, telemetry, or a different failure UI, both changes happen at
  the two spots this plan touches (the return in `processWatchlistAdd`, the
  guard in `handleWatchlistIconClick`) without needing to hunt for other
  places `movie` might be undefined.

## Out of scope

- The adjacent TODO at watchlist.js:3 (`createMovieObject(data)` missing the
  `watchlistStatus` second argument) is a separate, unrelated issue and is
  intentionally not addressed here.
- No files have been modified as part of producing this plan; this document
  only describes the intended change.
