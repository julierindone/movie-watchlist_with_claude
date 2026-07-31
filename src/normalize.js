export function createMovieObject(movie, watchlistStatus) {
	return {
		title: movie.Title,
		imdbID: movie.imdbID,
		rating: getRating(movie.Ratings) ?? null,
		runtime: movie.Runtime ?? null,
		year: movie.Year ?? null,
		genre: movie.Genre ?? null,
		plot: movie.Plot ?? null,
		thumbnail: getThumbnail(movie.Poster) ?? null,
		alt: `poster for ${movie.Title}`,
		watchlist: watchlistStatus
	};
}

function getThumbnail(poster) {
	return (!poster || !(poster.toLowerCase().startsWith("http"))) ? "assets/images/film_icon.png" : poster
}

function getRating(ratingsArray) {
	if (!ratingsArray) { return null; }
	const rottenTomato = ratingsArray.find(rating => rating.Source === "Rotten Tomatoes" && rating.Value)
	return rottenTomato ? rottenTomato.Value : null;
}
