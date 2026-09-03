import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vanilla-tilt', () => ({
	default: { init: vi.fn() },
}));

vi.mock('./helpers.js', () => ({
	getSpaceSaver: vi.fn(),
	toggleMainSection: vi.fn(),
	resetAll: vi.fn(),
}));

vi.mock('./watchlist.js', () => ({
	watchlistArray: [],
}));

vi.mock('./search.js', () => ({
	resultsArray: [],
	searchType: null,
}));

import { getSpaceSaver, toggleMainSection, resetAll } from './helpers.js';
import { watchlistArray } from './watchlist.js';
import * as searchModule from './search.js';
import {
	generateExactResultHtml,
	generateWatchlistHtml,
	generateMoreDetails,
	generateMoreDetailsError,
	generateAddDetailsToWatchlistItemError,
} from './render.js';

function createFakeElement() {
	return {
		innerHTML: '',
		style: {},
		classList: { add: vi.fn(), remove: vi.fn() },
	};
}

function createFakeMovie(overrides = {}) {
	return {
		title: 'Say Anything',
		imdbID: 'tt0098258',
		watchlist: false,
		rating: '98%',
		year: '1989',
		runtime: '100 min',
		genre: 'Comedy, Drama, Romance',
		plot: 'A great movie.',
		thumbnail: 'poster.jpg',
		alt: 'poster for Say Anything',
		...overrides,
	};
}

let mainWrapper;

beforeEach(() => {
	vi.clearAllMocks();
	watchlistArray.length = 0;
	searchModule.resultsArray.length = 0;
	searchModule.searchType = null;

	mainWrapper = createFakeElement();
	global.document = {
		getElementById: vi.fn(id => (id === 'main-wrapper' ? mainWrapper : null)),
		querySelectorAll: vi.fn(() => []),
	};
});

describe('generateExactResultHtml', () => {
	it('renders a single movie card with its title and rating for a normal result', () => {
		generateExactResultHtml([createFakeMovie()]);

		expect(mainWrapper.innerHTML).toContain('Say Anything');
		expect(mainWrapper.innerHTML).toContain('98%');
		expect(mainWrapper.innerHTML).toContain('fa-circle-plus');
		expect(toggleMainSection).toHaveBeenCalled();
	});

	it('shows a check icon instead of a plus icon when the movie is already on the watchlist', () => {
		generateExactResultHtml([createFakeMovie({ watchlist: true })]);

		expect(mainWrapper.innerHTML).toContain('fa-circle-check');
	});

	it('omits the rating markup when there is no rating for that title (no match found for that source)', () => {
		generateExactResultHtml([createFakeMovie({ rating: null })]);

		expect(mainWrapper.innerHTML).not.toContain('id="rating"');
	});

	it('throws for invalid input: an empty results array with no movie to read', () => {
		expect(() => generateExactResultHtml([])).toThrow();
	});
});

describe('generateWatchlistHtml', () => {
	it('renders a card for each movie currently on the watchlist', () => {
		watchlistArray.push(createFakeMovie());

		generateWatchlistHtml();

		expect(mainWrapper.innerHTML).toContain('Say Anything');
		expect(mainWrapper.innerHTML).toContain('fa-circle-check');
		expect(toggleMainSection).toHaveBeenCalled();
	});

	it('falls back to the empty-watchlist space-saver view when the watchlist is empty', () => {
		generateWatchlistHtml();

		expect(resetAll).toHaveBeenCalled();
		expect(getSpaceSaver).toHaveBeenCalledWith('watchlist');
	});

	it('renders defensively (does not throw) for a watchlist entry with missing/invalid fields', () => {
		watchlistArray.push({ imdbID: 'tt000' });

		expect(() => generateWatchlistHtml()).not.toThrow();
		expect(mainWrapper.innerHTML).toContain('movie-card');
	});
});

describe('generateMoreDetails', () => {
	function createFakeSummary() {
		return { style: {}, nextElementSibling: { innerHTML: '' } };
	}

	it('renders expanded details html and hides the summary control for a normal movie', () => {
		const summary = createFakeSummary();
		const movieDetails = { runtime: '100 min', genre: 'Comedy, Drama, Romance', rating: '98%', plot: 'A great movie.' };

		generateMoreDetails(summary, movieDetails);

		expect(summary.style.display).toBe('none');
		expect(summary.nextElementSibling.innerHTML).toContain('A great movie.');
		expect(summary.nextElementSibling.innerHTML).toContain('98%');
	});

	it('omits the rating block when there is no rating available for that title', () => {
		const summary = createFakeSummary();
		const movieDetails = { runtime: '100 min', genre: 'Drama', rating: null, plot: 'A great movie.' };

		generateMoreDetails(summary, movieDetails);

		expect(summary.nextElementSibling.innerHTML).not.toContain('id="rating"');
	});

	it('throws for invalid input when movieDetails is missing entirely', () => {
		const summary = createFakeSummary();

		expect(() => generateMoreDetails(summary, undefined)).toThrow();
	});
});

describe('generateMoreDetailsError', () => {
	it('renders a no-details message and hides the summary control for a normal (failed-lookup) call', () => {
		const nextElementSibling = { innerHTML: '' };
		const detailsSummary = { style: {}, nextElementSibling };

		generateMoreDetailsError(detailsSummary);

		expect(nextElementSibling.innerHTML).toContain('No further details were found');
		expect(detailsSummary.style.display).toBe('none');
	});

	it('throws for invalid input when the details summary is missing entirely', () => {
		expect(() => generateMoreDetailsError(undefined)).toThrow();
	});
});

describe('generateAddDetailsToWatchlistItemError', () => {
	function createFakeDetailsDiv() {
		return {
			innerHTML: '',
			previousElementSibling: { style: {} },
			parentElement: { setAttribute: vi.fn() },
		};
	}

	it('shows the "missing details" message only when addedToList is literally the string "true"', () => {
		const detailsDiv = createFakeDetailsDiv();

		generateAddDetailsToWatchlistItemError(detailsDiv, 'true');

		expect(detailsDiv.innerHTML).toContain('missing some details');
		expect(detailsDiv.previousElementSibling.style.display).toBe('none');
		expect(detailsDiv.parentElement.setAttribute).toHaveBeenCalledWith('open', '');
	});

	it('shows the generic failure message for the default (boolean true) addedToList value', () => {
		const detailsDiv = createFakeDetailsDiv();

		generateAddDetailsToWatchlistItemError(detailsDiv);

		expect(detailsDiv.innerHTML).toContain('has not been added to your watchlist');
	});

	it('shows the generic failure message when addedToList reflects a failed ("False") API response', () => {
		const detailsDiv = createFakeDetailsDiv();

		generateAddDetailsToWatchlistItemError(detailsDiv, 'False');

		expect(detailsDiv.innerHTML).toContain('has not been added to your watchlist');
	});

	it('throws for invalid input where detailsDiv is missing entirely', () => {
		expect(() => generateAddDetailsToWatchlistItemError(undefined)).toThrow();
	});
});
