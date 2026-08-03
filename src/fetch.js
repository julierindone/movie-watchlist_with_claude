import { getSpaceSaver } from "./helpers.js";
import { generateAddDetailsToWatchlistItemError, generateMoreDetailsError } from './render.js';

const apiKey = import.meta.env.VITE_OMDB_API_KEY;

export async function fetchExact(query) {
	let url = `https://omdbapi.com/?t=${query}&apikey=${apiKey}`;
	try {
		const response = await fetch(url);
		return response.json();
	}
	catch (error) {
		getSpaceSaver('error');
		console.error(error);
	}
}

export async function fetchFuzzy(query) {
	let url = `https://omdbapi.com/?s=${query}&apikey=${apiKey}`;
	try {
		const response = await fetch(url);
		return response.json();
	}
	catch (error) {
		getSpaceSaver('error');
		console.error(error);
	}
}

export async function fetchFromImdbId(imdbID, errorMessageDiv) {
	let url = `https://omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

	try {
		const response = await fetch(url);
		return response.json();
	}
	catch (error) {
		if (errorMessageDiv.classList.contains('details-div')) {
			generateAddDetailsToWatchlistItemError(errorMessageDiv);
		}
		else {
			generateMoreDetailsError(errorMessageDiv);
		}
		console.error(error);
	}
}

export function toMovieArray(searchType, data) {
	return searchType === "exact" ? [data] : data.Search;
}
