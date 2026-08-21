// TODO: Fix!
// watchlist.js:117-128 — processWatchlistAdd has no return in its if (data.Response === "False") branch, so it implicitly returns undefined. If an OMDb detail lookup ever fails, movie becomes undefined and the next line (addToWatchList(movie, ...)) throws.
// watchlist.js: 126 — createMovieObject(data) is called without the watchlistStatus second argument(unlike every other call site), leaving movie.watchlist briefly undefined before it's overwritten.;

import { resultsArray } from "./search.js";
import { generateAddDetailsToWatchlistItemError, renderHtml } from "./render.js";
import { createMovieObject } from "./normalize.js";
import { fetchFromImdbId } from "./fetch.js";

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
		addToWatchList(movie, detailsDiv);
	}

	// set localStorage to match updated watchlist
	setLocalStorageWatchlist();

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
	let data = await fetchFromImdbId(movie.imdbID, detailsDiv);

	// check if data response failed
	if (data.Response === "False") {
		generateAddDetailsToWatchlistItemError(detailsDiv, data.Response);
		console.error("Response was false.");
	}
	else {
		return createMovieObject(data);
	}
}
