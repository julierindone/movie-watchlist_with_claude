import { getSpaceSaver, toggleMainSection, resetAll } from './helpers.js';
import { watchlistArray } from './watchlist.js';
import { resultsArray, searchType } from './search.js';
import VanillaTilt from 'vanilla-tilt';

function addTilt() {
	VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
}

export function generateExactResultHtml(resultsArray) {
	let movie = resultsArray[0];
	let watchlistIcon = (movie.watchlist === true) ? "check" : "plus";
	let rating = generateRatingHtml(movie.rating);

	// note: removed imdb-id from article el but can't remember why so I may need to add it back in.
	let html =
		`<article class="movie-card">
		<img class="thumbnail" src="${movie.thumbnail}" alt="${movie.alt}" data-tilt data-tilt-reverse="true" />
		<div class="movie-details">
			<div class="title-watchlist">
				<h2>${movie.title}</h2>
				<i class="fa-solid fa-circle-${watchlistIcon}" data-imdb-id="${movie.imdbID}"></i>
			</div>
			<div class="runtime-year-genre-rating">
				<div class="runtime-year-genre">
					<p>${movie.year}&ensp;${movie.runtime}</p>
					<p class="genre">${movie.genre}</p>
				</div>
				${rating}
			</div>
			<p class="plot">${movie.plot}</p>
		</div>
	</article>
	<hr class="card-divider">`;

	toggleMainSection();
	document.getElementById('main-wrapper').innerHTML = html;
	addTilt();
}

export function generateFuzzyResultsHtml(resultsArray) {
	let html = '';
	for (let movie of resultsArray) {
		let watchlistIcon = (movie.watchlist === true) ? "check" : "plus";
		html +=
			`<article class="movie-card fuzzy-results" data-imdb-id="${movie.imdbID}">
				<img class="thumbnail" src="${movie.thumbnail}" alt="${movie.alt}" data-tilt data-tilt-reverse="true" />
				<div class="movie-details">
					<div class="title-watchlist">
						<h2>${movie.title}</h2>
						<i class="fa-solid fa-circle-${watchlistIcon}" data-imdb-id="${movie.imdbID}"></i>
					</div>
					<p class="year">${movie.year}</p>
					<details class="more-details">
						<summary class="details-summary" data-imdb-id="${movie.imdbID}">more</summary>
						<div class="details-div"></div>
					</details>
				</div>
			</article>
			<hr class="card-divider">`;
	};

	toggleMainSection();
	document.getElementById('main-wrapper').innerHTML = html;
	addTilt();
}

export function generateWatchlistHtml() {
	if (watchlistArray.length > 0) {
		let html = ``;

		watchlistArray.forEach(movie => {
			let rating = generateRatingHtml(movie.rating);
			html +=
				`<article class="movie-card">
					<img class="thumbnail" src="${movie.thumbnail}" alt="${movie.alt}" data-tilt data-tilt-reverse="true" />
					<div class="movie-details">
						<div class="title-watchlist">
							<h2>${movie.title}</h2>
							<i class="fa-solid fa-circle-check" data-imdb-id="${movie.imdbID}"></i>
						</div>
						<div class="runtime-year-genre-rating">
							<div class="runtime-year-genre">
								<p>${movie.year}&emsp;${movie.runtime}</p>
								<p class="genre">${movie.genre}</p>
							</div>
							${rating}
						</div>
						<p class="plot">${movie.plot}</p>
					</div>
				</article>
				<hr class="card-divider">`;
		});

		toggleMainSection();
		document.getElementById('main-wrapper').innerHTML = html;
		addTilt();
	}

	else {
		resetAll();
		getSpaceSaver('watchlist');
	}
}

function generateRatingHtml(rating) {
	if (rating) {
		return `
			<p id="rating">
				<i class="fa-solid fa-star"></i>
				${rating}
			</p>`;
	}
	else {
		return '';
	}
}

// render content based on type of list
export function renderHtml() {
	searchType === 'exact' ? generateExactResultHtml(resultsArray)
		: searchType === 'fuzzy' ? generateFuzzyResultsHtml(resultsArray)
			: generateWatchlistHtml();
}

export function generateMoreDetails(detailsSummary, movieDetails) {
	detailsSummary.style.display = 'none';
	let rating = generateRatingHtml(movieDetails.rating);
	let detailsHTML = `
		<div class="runtime-year-genre-rating">
			<div class="runtime-year-genre">
					<p>${movieDetails.runtime}</p>
					<p class="genre">${movieDetails.genre}</p>
			</div>
			${rating}
		</div>
		<p class="plot">${movieDetails.plot}</p>
		<button class="less-details">less</button>
		`;

	detailsSummary.nextElementSibling.innerHTML = detailsHTML;
	generateRatingHtml(movieDetails.rating);
}

// TODO: Make operational for SEARCH ONLY. I Think the watch one should be a separate function.
export function generateMoreDetailsError(detailsSummary) {
	// targets div.details-div when in the fuzzy search list.
	detailsSummary.nextElementSibling.innerHTML = '<p class="no-details-error">No further details were found.</p>';
	detailsSummary.style.display = 'none';
}

// TODO: This function name is riduclous. Change it.
export function generateAddDetailsToWatchlistItemError(detailsDiv, addedToList = true) {
	let message = addedToList === "true"
		? `<p class="no-details-error">This title has been added to your watchlist, but it is missing some details.</p>`
		: `<p class="no-details-error">Something has gone wrong! This title has not been added to your watchlist.</p>`;
	detailsDiv.innerHTML = message;
	detailsDiv.previousElementSibling.style.display = 'none';
	detailsDiv.parentElement.setAttribute('open', '');
}
