# Custom Tags Feature

Adds free-text tags to watchlist items, alongside genre, with a chip-based
entry UI and a single-select filter dropdown.

## Files touched

- `src/normalize.js` — `createMovieObject` now sets `tags: []` on new movies,
  next to the existing `notes: ''` field.
- `src/watchlist.js` — new tag storage/filter/mutation logic (see below).
- `src/render.js` — new markup for the tag chip list and tag entry input,
  wired into `generateWatchlistHtml`.
- `watchlist.html` — new `#tag-filter-select` dropdown next to the existing
  genre and watched-status filters.
- `index.js` — imports, element ref, init-time population, delegated click
  handling for chip removal/add-button, and a `keydown` listener for
  Enter-to-add.

`index.html` was not touched; it's the search page and has no filter UI or
watchlist cards.

## Data model / backward compatibility

Every read of `movie.tags` uses `movie.tags ?? []`, mirroring the existing
`movie.notes ?? ''` pattern, so watchlist items already in localStorage
(created before this feature) render with zero tags instead of throwing.
This appears in `getFilteredWatchlistArray`, `getAvailableTags`,
`handleRemoveTag`, `handleAddTag` (via `existingTags = movie.tags ?? []`),
and `generateTagsHtml`. No migration/backfill step was added; the field is
simply treated as absent-means-empty everywhere, same as notes.

## Tag entry (chips)

- `generateTagsHtml(movie)` in `src/render.js` builds a `.movie-tags` block
  per card: a `.tag-chip-list` of existing tags, plus a `.tag-entry` row with
  a `.tag-input` text field and a `.tag-add-btn` button. Chips are rendered
  by `generateTagChipHtml`, each with its own `.tag-chip-remove` button
  carrying `data-imdb-id` and `data-tag` attributes.
- Tag text is escaped via the existing `escapeHtml` helper (same as notes)
  before being placed in innerHTML, including in the `data-tag` attribute.
- `handleAddTag(movieImdbID, tagText)` (new, `src/watchlist.js`) trims the
  input, no-ops on empty string, de-dupes against the item's existing tags
  (case-sensitive exact match), appends, persists to localStorage, refreshes
  the tag filter dropdown, and re-renders.
- `handleRemoveTag(movieImdbID, tagText)` (new) filters the one tag out of
  the array, persists, refreshes the filter dropdown, and re-renders.
- Both handlers re-render the whole list (like `handleWatchedIconClick`),
  unlike `handleNoteChange` which only saves silently on blur — tags need a
  visible chip-list update after every add/remove, so silent-save wasn't an
  option here.
- In `index.js`: the click listener (delegated on `document`) gained two new
  branches, nested inside the existing `event.target.dataset.imdbId` check
  (chip-remove and add buttons both carry `data-imdb-id`, so they already
  fall into that branch and needed sibling `else if`s rather than new
  top-level branches). A separate `keydown` listener handles Enter inside
  `.tag-input`, calling `preventDefault()` then `handleAddTag`. After an
  add/remove, the whole list re-renders, so the input naturally clears.

## Tag filtering

Modeled directly on the genre filter, per the request:

- `TAG_FILTER_STORAGE_KEY = 'watchlistTagFilter'` (new constant, same naming
  pattern as `FILTER_STORAGE_KEY`/`WATCHED_FILTER_STORAGE_KEY`).
- `getStoredTagFilter()` / `handleTagFilterChange(tag)` mirror
  `getStoredGenreFilter`/`handleFilterChange`.
- `getAvailableTags()` / `populateTagFilterOptions()` /
  `buildTagOptionsHtml()` mirror `getAvailableGenres`/
  `populateGenreFilterOptions`/`buildGenreOptionsHtml`. Unlike genre (which
  is a comma-separated string split via `getGenreList`), tags are already an
  array, so no splitting step was needed.
- **Filter chain placement**: inside `getFilteredWatchlistArray()`, the new
  `.filter(movie => tag === 'all' || (movie.tags ?? []).includes(tag))` step
  was inserted as the *second* `.filter()` call — after the genre filter,
  before the watched-status filter — so the chain reads: genre -> tag ->
  watched. This keeps genre and tag (the two "category" filters) adjacent
  and leaves watched-status last, matching how it read before. Order between
  filter steps doesn't change the result (all three AND together), so this
  was a readability choice, not a functional one.
- `populateTagFilterOptions()` is called everywhere `populateGenreFilterOptions()`
  already was (`index.js` init block, `handleWatchlistIconClick`), plus after
  every `handleAddTag`/`handleRemoveTag`, since adding/removing a tag can
  change which tags are available to filter by.
- The dropdown falls back to `all` if the previously-stored tag no longer
  exists in the watchlist (e.g. the last item with that tag had it removed),
  same fallback behavior as the genre filter.

## Notes on scope

No CSS was written; new class names (`.movie-tags`, `.tag-chip-list`,
`.tag-chip`, `.tag-chip-remove`, `.tag-entry`, `.tag-input`, `.tag-add-btn`)
are unstyled, per instructions.
