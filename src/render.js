import { getSpaceSaver, toggleMainSection, resetAll, escapeHtml } from './helpers.js';
import { watchlistArray, getFilteredWatchlistArray } from './watchlist.js';
import { resultsArray, searchType } from './search.js';
import VanillaTilt from 'vanilla-tilt';

function addTilt() {
	VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
}

export function generateExactResultHtml(resultsArray) {
	let movie = resultsArray[0];
	let watchlistIcon = (movie.watchlist === true) ? "check" : "plus";
	let rating = generateRatingHtml(movie.rating, movie.imdbID);

	// note: removed imdb-id from article el but can't remember why so I may need to add it back in.
	let html =
		`<article class="movie-card">
			<div class="thumbnail-details">
				<img class="thumbnail" src="${movie.thumbnail}" alt="${movie.alt}" data-tilt data-tilt-reverse="true" />
				<div class="details">
					<div class="title">
						<h2>${movie.title}</h2>
					</div>
					<div class="runtime-year">
							<p>${movie.year}&emsp;${movie.runtime}</p>
					</div>
					<div class="watchlist-rating">
						${rating}
						<div>
							<i class="fa-solid fa-circle-${watchlistIcon}" data-imdb-id="${movie.imdbID}"></i>
							</div>
						</div>
						<p class="genre">${movie.genre}</p>
					</div>
				</div>
				<div class="extended-details">
					<p class="plot">${movie.plot}</p>
				</div>
		</div>
	</article>
	<hr class="card-divider">`;

	toggleMainSection();
	document.getElementById('main-wrapper').innerHTML = html;
	addTilt();
}

// TODO: Finish converting fuzzyresults to match new styling
export function generateFuzzyResultsHtml(resultsArray) {
	let html = '';
	for (let movie of resultsArray) {
		let watchlistIcon = (movie.watchlist === true) ? "check" : "plus";
		html +=
			`<article class="movie-card fuzzy-results" data-imdb-id="${movie.imdbID}">
			<div class="thumbnail-details">
				<img class="thumbnail" src="${movie.thumbnail}" alt="${movie.alt}" data-tilt data-tilt-reverse="true" />
				<div class="details">
					<div class="title">
					<h2>${movie.title}</h2>
					</div>
					<div class="watchlist-rating">
						<i class="fa-solid fa-circle-${watchlistIcon}" data-imdb-id="${movie.imdbID}"></i>
						<p class="year">${movie.year}</p>
					</div>
				</div>
			</div>
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
		let filteredMovies = getFilteredWatchlistArray();

		// genre and/or watched filter is active but matches nothing in the watchlist
		if (filteredMovies.length === 0) {
			resetAll();
			getSpaceSaver('no_filter_matches');
			return;
		}

		let html = ``;

		filteredMovies.forEach(movie => {
			let rating = generateRatingHtml(movie.rating, movie.imdbID);
			let note = generateNoteHtml(movie);
			let tags = generateTagsHtml(movie);
			html +=
				`<article class="movie-card">
					<div class="thumbnail-details">
						<img class="thumbnail" src="${movie.thumbnail}" alt="${movie.alt}" data-tilt data-tilt-reverse="true" />
						<div class="details">
							<div class="title">
								<h2>${movie.title}</h2>
							</div>
							<div class="runtime-year">
									<p>${movie.year}&emsp;${movie.runtime}</p>
							</div>
							<div class="watchlist-rating">
								${rating}
								<div>
									<i class="fa-solid fa-circle-check" data-imdb-id="${movie.imdbID}"></i>
									<i class="fa-${movie.watched ? 'solid' : 'regular'} fa-eye" data-imdb-id="${movie.imdbID}"></i>
								</div>
							</div>
							<p class="genre">${movie.genre}</p>
						</div>
					</div>
					<div class="extended-details">
						<p class="plot">${movie.plot}</p>
						${tags}
						${note}
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

function generateRatingHtml(rating, imdbID) {
	if (rating) {
		return `
			<p id="rating-${imdbID}">
				<i class="fa-solid fa-star"></i>
				${rating}
			</p>`;
	}
	else {
		return '';
	}
}

// Builds the note textarea markup, escaped to allow safe innerHTML use.
function generateNoteHtml(movie) {
	let noteText = escapeHtml(movie.notes ?? '');
	return `
		<div class="movie-note">
		<label class="note-label" for="note-${movie.imdbID}">notes:</label>
		<textarea
			class="note-input"
			id="note-${movie.imdbID}
			aria-label="input-note"
			data-imdb-id="${movie.imdbID}"
			placeholder="write a note"
		>${noteText}</textarea>
		</div>`;
}

// TODO: Update so if there are 0 tags, the tag-chip-list is hidden.
// Builds the tag chip list plus the entry input, escaped for innerHTML use.
function generateTagsHtml(movie) {
	let tags = movie.tags ?? [];
	let chipsHtml = tags.map(tag => generateTagChipHtml(movie.imdbID, tag)).join('');
	return `
		<div class="movie-tags">
			<label class="tags-label" for="tag-input-${movie.imdbID}">tags:</label>
			<div class="tag-chip-list">${chipsHtml}</div>
			<div class="tag-entry">
				<input type="text" class="tag-input" id="tag-input-${movie.imdbID}" data-imdb-id="${movie.imdbID}" placeholder="add a tag">
				<button type="button" class="tag-add-btn" data-imdb-id="${movie.imdbID}">add</button>
			</div>
		</div>`;
}

// Builds one removable tag chip, escaped to allow safe innerHTML use.
function generateTagChipHtml(imdbID, tag) {
	let safeTag = escapeHtml(tag);
	return `
		<span class="tag-chip">
			${safeTag}
			<button type="button" class="tag-chip-remove fa-solid fa-circle-xmark" data-imdb-id="${imdbID}" data-tag="${safeTag}"></button>
		</span>`;
}

// render content based on type of list
export function renderHtml() {
	searchType === 'exact' ? generateExactResultHtml(resultsArray)
		: searchType === 'fuzzy' ? generateFuzzyResultsHtml(resultsArray)
			: generateWatchlistHtml();
}

export function generateMoreDetails(detailsSummary, movieDetails) {
	detailsSummary.style.display = 'none';
	let rating = generateRatingHtml(movieDetails.rating, movieDetails.imdbID);
	let detailsHTML = `
		<div class="runtime-year-genre">
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
	generateRatingHtml(movieDetails.rating, movieDetails.imdbID);
}

// TODO: Make operational for SEARCH ONLY. I Think the watch one should be a separate function.
export function generateMoreDetailsError(detailsSummary) {
	// targets div.details-div when in the fuzzy search list.
	detailsSummary.nextElementSibling.innerHTML = '<p class="no-details-error">No further details were found.</p>';
	detailsSummary.style.display = 'none';
}

export function addDetailsToWatchlistItemError(detailsDiv, addedToWatchlist) {
	let message = addedToWatchlist
		? `<p class="no-details-error">This title has been added to your watchlist, but it is missing some details.</p>`
		: `<p class="no-details-error">Something has gone wrong! This title has not been added to your watchlist.</p>`;
	detailsDiv.innerHTML = message;
	detailsDiv.previousElementSibling.style.display = 'none';
	detailsDiv.parentElement.setAttribute('open', '');
}
