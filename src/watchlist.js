import { resultsArray } from "./search.js";
import { addDetailsToWatchlistItemError, renderHtml } from "./render.js";
import { createMovieObject } from "./normalize.js";
import { fetchFromImdbId } from "./fetch.js";
import { getSpaceSaver } from "./helpers.js";
export let watchlistArray = [];

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
		return;
	}

	// if there's a parsing error, completely reset it.
	catch (error) {
		console.log(`Corrupted JSON. Resetting. Error: ${error}`);
		watchlistArray = [];
		resetLocalStorageWatchlist();
	}
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
