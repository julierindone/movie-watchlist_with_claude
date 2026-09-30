import { resultsArray } from "./search.js";
import { addDetailsToWatchlistItemError, renderHtml } from "./render.js";
import { createMovieObject } from "./normalize.js";
import { fetchFromImdbId } from "./fetch.js";
import { getSpaceSaver, getStoredPreference, setStoredPreference } from "./helpers.js";
export let watchlistArray = [];

// Key used to persist the chosen watchlist sort order.
const SORT_STORAGE_KEY = 'watchlistSort';

// Key used to persist the chosen watchlist genre filter.
const FILTER_STORAGE_KEY = 'watchlistGenreFilter';

// Key used to persist the chosen watchlist watched-status filter.
const WATCHED_FILTER_STORAGE_KEY = 'watchlistWatchedFilter';

// Key used to persist the chosen watchlist tag filter.
const TAG_FILTER_STORAGE_KEY = 'watchlistTagFilter';

// get list from localStorage
function getLocalStorageWatchlist() {
	return JSON.parse(localStorage.getItem("watchlist"));
}

function setLocalStorageWatchlist() {
	localStorage.setItem("watchlist", JSON.stringify(watchlistArray));
}

function resetLocalStorageWatchlist() {
	localStorage.setItem("watchlist", JSON.stringify([]));
}

// Check to see if localStorage has a usable watchlist ; if not, create/reset one.
export function initLocalStorageWatchlist() {
	let storedWatchlist = getLocalStorageWatchlist();

	if (storedWatchlist === null) {
		console.log("Watchlist doesn't exist. Initializing.");
		resetLocalStorageWatchlist();
		return;
	}

	// if it exists, parse it.
	try {
		watchlistArray = getLocalStorageWatchlist();

		// Backfill legacy items, then persist only if something changed.
		if (backfillLegacyWatchlistFields()) {
			setLocalStorageWatchlist();
		}
		return;
	}

	// if there's a parsing error, completely reset it.
	catch (error) {
		console.log(`Corrupted JSON. Resetting. Error: ${error}`);
		watchlistArray = [];
		resetLocalStorageWatchlist();
	}
}

// Adds missing notes/tags fields to legacy watchlist items in place.
// Returns true if any item was changed, so callers can skip no-op writes.
function backfillLegacyWatchlistFields() {
	let backfilledCount = 0;

	watchlistArray.forEach(movie => {
		let missingNotes = movie.notes == null;
		let missingTags = movie.tags == null;

		if (missingNotes) movie.notes = '';
		if (missingTags) movie.tags = [];
		if (missingNotes || missingTags) backfilledCount++;
	});

	if (backfilledCount > 0) {
		console.log(`Backfilled notes/tags on ${backfilledCount} legacy watchlist item(s) at ${new Date().toISOString()}.`);
	}

	return backfilledCount > 0;
}

export async function handleWatchlistIconClick(eTarget) {
	let movie = getClickedMovie(eTarget.dataset.imdbId);
	if (movie == null) {
		getSpaceSaver('error');
		return null;
	}
	let detailsDiv = eTarget.closest('.movie-details').querySelector('.details-div');

	// add or remove as needed
	if (onWatchlist(movie.imdbID)) {
		removeFromWatchlist(movie);
	}
	else {
		// if full details not present, fetch before adding movie to watchlist
		if (!movie.genre) {
			movie = await processWatchlistAdd(movie, detailsDiv);
		}
		if (movie != null) {
			addToWatchList(movie, detailsDiv);
		}
	}

	// set localStorage to match updated watchlist
	setLocalStorageWatchlist();

	// refresh genre and tag options in case adding/removing changed what's available
	populateGenreFilterOptions();
	populateTagFilterOptions();

	// FIX LATER: this is clobbering the error messages.
	// render content based on type of list
	renderHtml(resultsArray, watchlistArray);
}

function removeFromWatchlist(movie) {
	// change watchlist status in object in resultsArray
	if (document.getElementById('search-page')) {
		// let resultsIndex = getResultsIndex(movie.imdbID);
		let resultsIndex = resultsArray.findIndex(movieInResults => movieInResults.imdbID === movie.imdbID);
		resultsArray[resultsIndex].watchlist = false;
	};

	// remove movie from watchlist
	let watchlistIndex = getWatchlistIndex(movie.imdbID);
	watchlistArray.splice(watchlistIndex, 1);
}

function addToWatchList(movie) {
	// change watchlist status in object in resultsArray
	if (document.getElementById('search-page')) {
		let resultsIndex = getResultsIndex(movie.imdbID);
		resultsArray[resultsIndex].watchlist = true;
	};

	// change watchlist status in object
	movie.watchlist = true;

	// add movie to watchlist
	watchlistArray.push(movie);
}

export function handleWatchedIconClick(eTarget) {
	let movie = watchlistArray.find(movie => movie.imdbID === eTarget.dataset.imdbId);
	if (movie == null) {
		getSpaceSaver('error');
		return null;
	}

	movie.watched = !movie.watched;

	// set localStorage to match updated watchlist
	setLocalStorageWatchlist();

	// re-render to reflect updated icon
	renderHtml();
}

// Saves a trimmed note onto the matching watchlist movie and persists it.
export function handleNoteChange(movieImdbID, noteText) {
	let movie = watchlistArray.find(movie => movie.imdbID === movieImdbID);
	if (movie == null) {
		getSpaceSaver('error');
		console.error(`handleNoteChange failed: no watchlist item found for imdbID "${movieImdbID}".`);
		return null;
	}

	let trimmedNote = noteText.trim();

	// Skip the write when the note is unchanged, so the log stays meaningful.
	if ((movie.notes ?? '') === trimmedNote) {
		return null;
	}

	movie.notes = trimmedNote;
	setLocalStorageWatchlist();
	console.log(`Note updated for imdbID "${movieImdbID}" at ${new Date().toISOString()}.`);
}

// Appends a new tag to the matching watchlist movie, then persists and re-renders.
export function handleAddTag(movieImdbID, tagText) {
	let movie = watchlistArray.find(movie => movie.imdbID === movieImdbID);
	if (movie == null) {
		getSpaceSaver('error');
		console.error(`handleAddTag failed: no watchlist item found for imdbID "${movieImdbID}".`);
		return null;
	}

	let trimmedTag = tagText.trim();
	if (trimmedTag === '') {
		return null;
	}

	let existingTags = movie.tags ?? [];

	// Skip if this tag is already on the item.
	if (existingTags.includes(trimmedTag)) {
		return null;
	}

	movie.tags = [...existingTags, trimmedTag];
	setLocalStorageWatchlist();
	populateTagFilterOptions();
	renderHtml();
}

// Removes one tag from the matching watchlist movie, then persists and re-renders.
export function handleRemoveTag(movieImdbID, tagText) {
	let movie = watchlistArray.find(movie => movie.imdbID === movieImdbID);
	if (movie == null) {
		getSpaceSaver('error');
		console.error(`handleRemoveTag failed: no watchlist item found for imdbID "${movieImdbID}".`);
		return null;
	}

	movie.tags = (movie.tags ?? []).filter(tag => tag !== tagText);
	setLocalStorageWatchlist();
	populateTagFilterOptions();
	renderHtml();
}

function getClickedMovie(clickedImdbID) {
	if (document.getElementById('watchlist-page')) {
		return watchlistArray.find(movie => movie.imdbID === clickedImdbID);

	}
	else {
		return resultsArray.find(movie => movie.imdbID === clickedImdbID);
	}
}

export function onWatchlist(movieImdbID) {
	return watchlistArray.some(watchlistMovie => watchlistMovie.imdbID === movieImdbID);
}

function getWatchlistIndex(movieImdbID) {
	return watchlistArray.findIndex(movie => movie.imdbID === movieImdbID);
}

// Reads the saved sort preference, defaulting to title if unset.
export function getStoredSortPreference() {
	return getStoredPreference(SORT_STORAGE_KEY, 'title');
}

// Sorts the watchlist by the chosen field, persists it, then re-renders.
export function handleSortChange(sortType) {
	setStoredPreference(SORT_STORAGE_KEY, sortType);
	sortWatchlistArray(sortType);
	renderHtml();
}

// Mutates watchlistArray in place using the comparator for sortType.
function sortWatchlistArray(sortType) {
	if (sortType === 'title') {
		watchlistArray.sort(compareByTitle);
	}
	else if (sortType === 'year') {
		watchlistArray.sort(compareByYear);
	}
	else if (sortType === 'rating') {
		watchlistArray.sort(compareByRating);
	}
}

// Compares titles alphabetically, A to Z.
function compareByTitle(movieA, movieB) {
	return (movieA.title ?? '').localeCompare(movieB.title ?? '');
}

// Compares years numerically, newest to oldest.
function compareByYear(movieA, movieB) {
	return getYearValue(movieB.year) - getYearValue(movieA.year);
}

// Compares ratings numerically, highest to lowest.
function compareByRating(movieA, movieB) {
	return getRatingValue(movieB.rating) - getRatingValue(movieA.rating);
}

// Parses a year string into a number; missing years sort last.
function getYearValue(year) {
	let parsed = parseInt(year, 10);
	return isNaN(parsed) ? -Infinity : parsed;
}

// Parses a percentage rating string into a number; missing ratings sort last.
function getRatingValue(rating) {
	let parsed = parseInt(rating, 10);
	return isNaN(parsed) ? -Infinity : parsed;
}

// Reads the saved genre filter, defaulting to "all" if unset.
export function getStoredGenreFilter() {
	return getStoredPreference(FILTER_STORAGE_KEY, 'all');
}

// Persists the chosen genre filter, then re-renders the list.
export function handleFilterChange(genre) {
	setStoredPreference(FILTER_STORAGE_KEY, genre);
	renderHtml();
}

// Reads the saved watched-status filter, defaulting to "all" if unset.
export function getStoredWatchedFilter() {
	return getStoredPreference(WATCHED_FILTER_STORAGE_KEY, 'all');
}

// Persists the chosen watched-status filter, then re-renders the list.
export function handleWatchedFilterChange(watchedStatus) {
	setStoredPreference(WATCHED_FILTER_STORAGE_KEY, watchedStatus);
	renderHtml();
}

// Reads the saved tag filter, defaulting to "all" if unset.
export function getStoredTagFilter() {
	return getStoredPreference(TAG_FILTER_STORAGE_KEY, 'all');
}

// Persists the chosen tag filter, then re-renders the list.
export function handleTagFilterChange(tag) {
	setStoredPreference(TAG_FILTER_STORAGE_KEY, tag);
	renderHtml();
}

// Returns the watchlist narrowed by the saved genre, tag, and watched-status filters.
export function getFilteredWatchlistArray() {
	let genre = getStoredGenreFilter();
	let tag = getStoredTagFilter();
	let watchedFilter = getStoredWatchedFilter();

	return watchlistArray
		.filter(movie => genre === 'all' || getGenreList(movie.genre).includes(genre))
		.filter(movie => tag === 'all' || (movie.tags ?? []).includes(tag))
		.filter(movie => {
			if (watchedFilter === 'watched') return movie.watched === true;
			if (watchedFilter === 'unwatched') return movie.watched !== true;
			return true;
		});
}

// Splits a comma-separated genre string into trimmed genre names.
function getGenreList(genreString) {
	return genreString ? genreString.split(',').map(genre => genre.trim()) : [];
}

// Builds the sorted list of unique genres present in the watchlist.
function getAvailableGenres() {
	let allGenres = watchlistArray.flatMap(movie => getGenreList(movie.genre));
	return [...new Set(allGenres)].sort();
}

// Rebuilds the genre filter dropdown from genres in the watchlist.
export function populateGenreFilterOptions() {
	let filterSelect = document.getElementById('genre-filter-select');
	if (!filterSelect) return;

	let availableGenres = getAvailableGenres();
	filterSelect.innerHTML = buildGenreOptionsHtml(availableGenres);

	// Fall back to "all" if the saved genre no longer exists in the list.
	let storedGenre = getStoredGenreFilter();
	let validGenre = availableGenres.includes(storedGenre) ? storedGenre : 'all';
	filterSelect.value = validGenre;
	setStoredPreference(FILTER_STORAGE_KEY, validGenre);
}

// Builds the <option> markup for the genre filter dropdown.
function buildGenreOptionsHtml(genres) {
	let optionsHtml = '<option value="all">All Genres</option>';
	genres.forEach(genre => {
		optionsHtml += `<option value="${genre}">${genre}</option>`;
	});
	return optionsHtml;
}

// Builds the sorted list of unique tags present in the watchlist.
function getAvailableTags() {
	let allTags = watchlistArray.flatMap(movie => movie.tags ?? []);
	return [...new Set(allTags)].sort();
}

// Rebuilds the tag filter dropdown from tags in the watchlist.
export function populateTagFilterOptions() {
	let filterSelect = document.getElementById('tag-filter-select');
	if (!filterSelect) return;

	let availableTags = getAvailableTags();
	filterSelect.innerHTML = buildTagOptionsHtml(availableTags);

	// Fall back to "all" if the saved tag no longer exists in the list.
	let storedTag = getStoredTagFilter();
	let validTag = availableTags.includes(storedTag) ? storedTag : 'all';
	filterSelect.value = validTag;
	setStoredPreference(TAG_FILTER_STORAGE_KEY, validTag);
}

// Builds the <option> markup for the tag filter dropdown.
function buildTagOptionsHtml(tags) {
	let optionsHtml = '<option value="all">All Tags</option>';
	tags.forEach(tag => {
		optionsHtml += `<option value="${tag}">${tag}</option>`;
	});
	return optionsHtml;
}

function getResultsIndex(movieImdbID) {
	return resultsArray.findIndex(movie => movie.imdbID === movieImdbID);
}

async function processWatchlistAdd(movie, detailsDiv) {
	try {
		let data = await fetchFromImdbId(movie.imdbID);
		let response = data.Response;
		if (response === "False") {
			// OMdb-level failure. Ex: invalid ImdbID
			addDetailsToWatchlistItemError(detailsDiv, true);
			// Still adds the movie to the watchlist sans details, so it just returns the original movie object.
			return movie;
		}
		else {
			return createMovieObject(data, true);
		}
	}
	catch {
		// Movie not added (Could add anyway in localstorage, but not a db). Ex: Network down or invalid API key.
		addDetailsToWatchlistItemError(detailsDiv);
		return null;
	}
}
