import { createMovieObject } from './normalize.js';
import * as fetch from './fetch.js';
import * as helpers from './helpers.js';
import { onWatchlist } from './watchlist.js';
import { generateExactResultHtml, generateFuzzyResultsHtml, generateMoreDetails, generateMoreDetailsError } from './render.js';

const searchBar = document.getElementById('search-bar');

export let resultsArray = [];
export let movieDetails = {};
export let searchType = null;

// Setter for the module-level searchType, so other modules can update which
// search mode (exact/fuzzy/watchlist) is currently active without reaching
// in and mutating the exported binding directly.
export function setSearchType(value) { searchType = value; }

// Entry point for a search: reads the query from the search bar, determines
// which search mode is active, fetches results from the API, normalizes them
// into movie objects, and hands them off to be rendered as HTML.
export async function searchMovies() {
	const query = (searchBar.value).replaceAll(' ', '+');
	setSearchType(getSearchType());
	helpers.resetAll();

	// fetch data
	let data = searchType === "exact"
		? await fetch.fetchExact(query)
		: await fetch.fetchFuzzy(query);

	// validate data - for when title(s) not found in API
	if (data.Response.toLowerCase() === "false") {
		helpers.getSpaceSaver('no_matches');
		console.error("Title not found.")
		return;
	}

	// reassign data to be stored in arrays
	data = fetch.toMovieArray(searchType, data);

	// create normalized array of movies
	resultsArray = data.map(movie => createMovieObject(movie, onWatchlist(movie.imdbID)));

	// TODO: Couldn't I be calling renderHTML from here?
	// create html by type
	searchType === "exact"
		? generateExactResultHtml(resultsArray)
		: generateFuzzyResultsHtml(resultsArray);
}

// Inspects the checked radio button among the 'search-type' inputs to figure
// out which mode the UI is currently set to. Doubles as the source of truth
// for the watchlist view.
function getSearchType() {
	const searchTypes = document.getElementsByName('search-type');

	// Determine fuzzy search, exact search, or the watchlist page since var is also used to determine type of list.
	let currentType = Array.from(searchTypes).filter(type => type.checked)[0];

	let typeOfSearch = currentType.id.includes('exact')
		? 'exact'
		: currentType.id.includes('fuzzy')
			? 'fuzzy'
			: 'watchlist';
	return typeOfSearch;
}

// Fallback handler wired to a poster <img>'s onerror event: swaps in a
// placeholder icon and alt text whenever a movie's poster fails to load.
export function handleImageError(brokenImage) {
	brokenImage.src = './assets/images/film_icon.png';
	brokenImage.alt = 'film poster not found';
}

// Click handler for a result's "more details" control: looks up the full
// movie record by IMDb ID and renders an expanded details view for it.
// TODO: add error message back in here in next commit. Return might have been messing things up.
// TODO: Refactor to use details tag
export async function handleMoreDetailsClick(eTarget) {
	const imdbID = eTarget.attributes[1].value;

	let data = await fetch.fetchFromImdbId(imdbID, eTarget);
	// if it can't find the imdbId (like if it doesn't exist)
	if (data.Response === "False") {
		generateMoreDetailsError(eTarget);
		console.error("Response was false.");
	}

	movieDetails = createMovieObject(data);
	generateMoreDetails(eTarget, movieDetails);
}

// Click handler for a result's "less details" control: collapses the
// expanded <details> section for that movie back to its closed state.
export async function handleLessDetailsClick(eTarget) {
	const details = eTarget.closest('details');

	if (details) {
		// TODO: I'd moved this out of the details conditional in the stash... why?
		const summary = details.querySelector('summary');
		details.removeAttribute('open');
		summary.style.display = 'unset';
	}
}
