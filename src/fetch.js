const apiKey = import.meta.env.VITE_OMDB_API_KEY;

export async function fetchExact(query) {
	let url = `https://omdbapi.com/?t=${query}&apikey=${apiKey}`;
	const response = await fetch(url);

	if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
	return response.json();
}

export async function fetchFuzzy(query) {
	let url = `https://omdbapi.com/?s=${query}&apikey=${apiKey}`;
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

	return response.json();
}

export async function fetchFromImdbId(imdbID) {
	let url = `https://omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;
	const response = await fetch(url);

	if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
	return response.json();
}

export function toMovieArray(searchType, data) {
	return searchType === "exact" ? [data] : data.Search;
}
