import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

vi.mock('./normalize.js', () => ({
	createMovieObject: vi.fn(),
}));

vi.mock('./fetch.js', () => ({
	fetchExact: vi.fn(),
	fetchFuzzy: vi.fn(),
	fetchFromImdbId: vi.fn(),
	toMovieArray: vi.fn(),
}));

vi.mock('./helpers.js', () => ({
	resetAll: vi.fn(),
	getSpaceSaver: vi.fn(),
}));

vi.mock('./watchlist.js', () => ({
	onWatchlist: vi.fn(),
}));

vi.mock('./render.js', () => ({
	generateExactResultHtml: vi.fn(),
	generateFuzzyResultsHtml: vi.fn(),
	generateMoreDetails: vi.fn(),
	generateMoreDetailsError: vi.fn(),
}));

import { createMovieObject } from './normalize.js';
import { fetchExact, fetchFuzzy, fetchFromImdbId, toMovieArray } from './fetch.js';
import { resetAll, getSpaceSaver } from './helpers.js';
import { onWatchlist } from './watchlist.js';
import {
	generateExactResultHtml,
	generateFuzzyResultsHtml,
	generateMoreDetails,
	generateMoreDetailsError,
} from './render.js';

// search.js reads `document.getElementById('search-bar')` at module load time,
// so global.document must exist *before* the module is imported. Since static
// imports are evaluated before any other code in this file runs, we set up the
// fake DOM first and pull the module in dynamically inside beforeAll.
let searchBarEl;
let radioButtons;
let searchModule;
let searchMovies, setSearchType, handleImageError, handleMoreDetailsClick, handleLessDetailsClick;

beforeAll(async () => {
	searchBarEl = { value: '' };
	radioButtons = [];
	global.document = {
		getElementById: vi.fn(id => (id === 'search-bar' ? searchBarEl : null)),
		getElementsByName: vi.fn(() => radioButtons),
	};

	searchModule = await import('./search.js');
	({ searchMovies, setSearchType, handleImageError, handleMoreDetailsClick, handleLessDetailsClick } = searchModule);
});

beforeEach(() => {
	vi.clearAllMocks();
	searchBarEl.value = '';
	radioButtons.length = 0;
	searchModule.resultsArray.length = 0;
	onWatchlist.mockReturnValue(false);
	toMovieArray.mockImplementation((searchType, data) => (searchType === 'exact' ? [data] : data && data.Search));
	createMovieObject.mockImplementation(movie => ({ ...movie, title: movie && movie.Title }));
});

function setRadioType(type) {
	radioButtons.push({ id: `${type}-search-radio`, checked: true });
}

describe('setSearchType', () => {
	it('updates the module-level searchType for a normal value', () => {
		setSearchType('exact');
		expect(searchModule.searchType).toBe('exact');
	});

	it('accepts falsy/invalid input without throwing, storing it as-is', () => {
		expect(() => setSearchType(undefined)).not.toThrow();
		expect(searchModule.searchType).toBeUndefined();
	});
});

describe('searchMovies', () => {
	it('fetches, normalizes, and renders results for a normal exact search', async () => {
		setRadioType('exact');
		searchBarEl.value = 'Say Anything';
		fetchExact.mockResolvedValue({ Response: 'True', Title: 'Say Anything', imdbID: 'tt0098258' });

		await searchMovies();

		expect(resetAll).toHaveBeenCalled();
		expect(fetchExact).toHaveBeenCalledWith(expect.stringContaining('Say+Anything'));
		expect(searchModule.resultsArray).toHaveLength(1);
		expect(searchModule.resultsArray[0].title).toBe('Say Anything');
		expect(generateExactResultHtml).toHaveBeenCalledWith(searchModule.resultsArray);
	});

	it('shows the no-matches state and does not render results for a fuzzy search with no hits', async () => {
		setRadioType('fuzzy');
		searchBarEl.value = 'asdkjhaslkdjh';
		fetchFuzzy.mockResolvedValue({ Response: 'False', Error: 'Movie not found!' });
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		await searchMovies();

		expect(getSpaceSaver).toHaveBeenCalledWith('no_matches');
		expect(generateFuzzyResultsHtml).not.toHaveBeenCalled();
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it('rejects when the underlying fetch call fails (network/API failure)', async () => {
		setRadioType('exact');
		searchBarEl.value = 'Say Anything';
		fetchExact.mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(searchMovies()).rejects.toThrow();
	});

	it('throws for invalid input when the search bar has no readable value', async () => {
		setRadioType('exact');
		searchBarEl.value = undefined;

		await expect(searchMovies()).rejects.toThrow();
	});
});

describe('handleImageError', () => {
	it('swaps in the fallback poster and alt text for a normal broken image', () => {
		const img = { src: 'https://example.com/broken.jpg', alt: 'poster for Say Anything' };

		handleImageError(img);

		expect(img.src).toBe('./assets/images/film_icon.png');
		expect(img.alt).toBe('film poster not found');
	});

	it('overwrites an already-empty image element without throwing (edge case)', () => {
		const img = { src: '', alt: '' };

		expect(() => handleImageError(img)).not.toThrow();
		expect(img.src).toBe('./assets/images/film_icon.png');
	});

	it('throws for invalid input where the image element is missing entirely', () => {
		expect(() => handleImageError(undefined)).toThrow();
	});
});

describe('handleMoreDetailsClick', () => {
	function createFakeTarget(imdbID) {
		return { attributes: [{}, { value: imdbID }] };
	}

	it('fetches and renders expanded details for a normal lookup', async () => {
		const target = createFakeTarget('tt0098258');
		fetchFromImdbId.mockResolvedValue({ Response: 'True', Title: 'Say Anything', imdbID: 'tt0098258' });

		await handleMoreDetailsClick(target);

		expect(fetchFromImdbId).toHaveBeenCalledWith('tt0098258', target);
		expect(generateMoreDetails).toHaveBeenCalledWith(target, expect.objectContaining({ title: 'Say Anything' }));
	});

	it('renders the more-details error UI when the imdbID has no match, but (per current code) still renders details afterward', async () => {
		const target = createFakeTarget('tt0000000');
		fetchFromImdbId.mockResolvedValue({ Response: 'False', Error: 'Incorrect IMDb ID.' });
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		await handleMoreDetailsClick(target);

		expect(generateMoreDetailsError).toHaveBeenCalledWith(target);
		expect(consoleSpy).toHaveBeenCalled();
		// Note: there's no `return` after the Response === "False" branch in
		// handleMoreDetailsClick, so it falls through and still calls
		// generateMoreDetails with the (failed) data - this asserts that real,
		// current behavior rather than the presumably-intended one.
		expect(generateMoreDetails).toHaveBeenCalledWith(target, expect.anything());
		consoleSpy.mockRestore();
	});

	it('rejects when the details fetch fails (network/API failure)', async () => {
		const target = createFakeTarget('tt0098258');
		fetchFromImdbId.mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(handleMoreDetailsClick(target)).rejects.toThrow();
	});

	it('rejects for invalid input where the click target is missing entirely', async () => {
		await expect(handleMoreDetailsClick(undefined)).rejects.toThrow();
	});
});

describe('handleLessDetailsClick', () => {
	it('collapses an open details section for a normal click', async () => {
		const summary = { style: {} };
		const details = { removeAttribute: vi.fn(), querySelector: vi.fn(() => summary) };
		const target = { closest: vi.fn(() => details) };

		await handleLessDetailsClick(target);

		expect(details.removeAttribute).toHaveBeenCalledWith('open');
		expect(summary.style.display).toBe('unset');
	});

	it('does nothing when the click target has no enclosing details element', async () => {
		const target = { closest: vi.fn(() => null) };

		await expect(handleLessDetailsClick(target)).resolves.toBeUndefined();
	});

	it('throws for invalid input where the click target is missing entirely', async () => {
		await expect(handleLessDetailsClick(undefined)).rejects.toThrow();
	});
});
