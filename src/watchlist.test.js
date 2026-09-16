import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./search.js', () => ({
	resultsArray: [],
}));

vi.mock('./render.js', () => ({
	addDetailsToWatchlistItemError: vi.fn(),
	renderHtml: vi.fn(),
}));

vi.mock('./fetch.js', () => ({
	fetchFromImdbId: vi.fn(),
}));

vi.mock('./helpers.js', () => ({
	getSpaceSaver: vi.fn(),
}));

import { resultsArray } from './search.js';
import { addDetailsToWatchlistItemError, renderHtml } from './render.js';
import { fetchFromImdbId } from './fetch.js';
import { getSpaceSaver } from './helpers.js';
import { handleWatchlistIconClick, watchlistArray, onWatchlist } from './watchlist.js';

function createFakeIconTarget(imdbId, detailsDiv = {}) {
	return {
		dataset: { imdbId },
		closest: () => ({
			querySelector: () => detailsDiv,
		}),
	};
}

function createFullMovie(imdbID) {
	return {
		imdbID,
		title: 'Say Anything',
		genre: 'Comedy, Drama, Romance',
		watchlist: false,
	};
}

beforeEach(() => {
	resultsArray.length = 0;
	watchlistArray.length = 0;
	vi.clearAllMocks();

	global.localStorage = {
		store: {},
		getItem: vi.fn(key => global.localStorage.store[key] ?? null),
		setItem: vi.fn((key, value) => { global.localStorage.store[key] = value; }),
	};
	global.document = {
		getElementById: vi.fn(() => null),
	};
});

describe('addToWatchList', () => {
	it('adds a movie (already fully detailed) to the watchlist and marks it as watchlisted', async () => {
		const movie = createFullMovie('tt0098258');
		resultsArray.push(movie);

		await handleWatchlistIconClick(createFakeIconTarget('tt0098258'));

		expect(watchlistArray).toHaveLength(1);
		expect(watchlistArray[0].imdbID).toBe('tt0098258');
		expect(watchlistArray[0].watchlist).toBe(true);
	});
});

describe('removeFromWatchlist', () => {
	it('removes a movie already on the watchlist when its icon is clicked again', async () => {
		const movie = createFullMovie('tt0098258');
		watchlistArray.push(movie);
		global.document.getElementById = vi.fn(id => (id === 'watchlist-page' ? {} : null));

		expect(onWatchlist('tt0098258')).toBe(true);

		await handleWatchlistIconClick(createFakeIconTarget('tt0098258'));

		expect(watchlistArray).toHaveLength(0);
		expect(onWatchlist('tt0098258')).toBe(false);
	});
});

describe('handleWatchlistIconClick', () => {
	it('persists the updated watchlist to localStorage and re-renders after adding a movie', async () => {
		const movie = createFullMovie('tt0098258');
		resultsArray.push(movie);

		await handleWatchlistIconClick(createFakeIconTarget('tt0098258'));

		expect(global.localStorage.setItem).toHaveBeenCalledWith('watchlist', JSON.stringify(watchlistArray));
		expect(renderHtml).toHaveBeenCalled();
	});
});

import { initLocalStorageWatchlist } from './watchlist.js';

describe('initLocalStorageWatchlist', () => {
	it('loads an existing, valid watchlist from localStorage into watchlistArray for a normal startup', () => {
		const storedMovies = [createFullMovie('tt0098258'), createFullMovie('tt0000002')];
		global.localStorage.store.watchlist = JSON.stringify(storedMovies);

		initLocalStorageWatchlist();

		expect(watchlistArray).toEqual(storedMovies);
	});

	it('initializes an empty watchlist in localStorage when none exists yet (first run / empty result)', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		initLocalStorageWatchlist();

		expect(global.localStorage.setItem).toHaveBeenCalledWith('watchlist', JSON.stringify([]));
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it('throws instead of recovering when localStorage access itself fails (e.g. storage disabled/unavailable)', () => {
		global.localStorage.getItem = vi.fn(() => { throw new Error('SecurityError: storage disabled'); });

		expect(() => initLocalStorageWatchlist()).toThrow();
	});

	it('throws for invalid input: corrupted (non-JSON) data stored under the watchlist key', () => {
		global.localStorage.store.watchlist = '{not valid json';

		// Note: the initial null-check call to getLocalStorageWatchlist() (line 27) sits
		// outside the try/catch, so a JSON.parse failure here throws immediately instead
		// of being caught and recovered by the catch block below it.
		expect(() => initLocalStorageWatchlist()).toThrow();
	});
});

describe('processWatchlistAdd (exercised indirectly via handleWatchlistIconClick)', () => {
	it('does not add the movie and shows the generic failure message when fetching full details throws (e.g. network down)', async () => {
		const movie = createFullMovie('tt0098258');
		delete movie.genre; // missing details triggers the fetch-before-add path
		resultsArray.push(movie);
		fetchFromImdbId.mockRejectedValue(new TypeError('Failed to fetch'));

		const result = await handleWatchlistIconClick(createFakeIconTarget('tt0098258'));

		expect(fetchFromImdbId).toHaveBeenCalledWith('tt0098258');
		expect(addDetailsToWatchlistItemError).toHaveBeenCalledTimes(1);
		// called with no addedToWatchlist arg (undefined) on the catch path
		expect(addDetailsToWatchlistItemError.mock.calls[0][1]).toBeUndefined();
		expect(watchlistArray).toHaveLength(0);
		expect(result).toBeUndefined();
	});

	it('still adds the movie (without extra details) and flags the missing-details message when OMDb responds Response: "False"', async () => {
		const movie = createFullMovie('tt0098258');
		delete movie.genre;
		resultsArray.push(movie);
		fetchFromImdbId.mockResolvedValue({ Response: 'False', Error: 'Incorrect IMDb ID.' });

		await handleWatchlistIconClick(createFakeIconTarget('tt0098258'));

		expect(addDetailsToWatchlistItemError).toHaveBeenCalledWith(expect.anything(), true);
		expect(watchlistArray).toHaveLength(1);
		expect(watchlistArray[0].imdbID).toBe('tt0098258');
		expect(watchlistArray[0].watchlist).toBe(true);
		expect(watchlistArray[0].genre).toBeUndefined();
	});

	it('does not add the movie when OMDb returns malformed/unparseable JSON for the imdbID lookup', async () => {
		const movie = createFullMovie('tt0098258');
		delete movie.genre;
		resultsArray.push(movie);
		fetchFromImdbId.mockRejectedValue(new SyntaxError('Unexpected token < in JSON at position 0'));

		await handleWatchlistIconClick(createFakeIconTarget('tt0098258'));

		expect(addDetailsToWatchlistItemError.mock.calls[0][1]).toBeUndefined();
		expect(watchlistArray).toHaveLength(0);
	});
});

describe('handleWatchlistIconClick - null movie guard', () => {
	it('shows the space-saver error state and exits early (without touching localStorage or rendering) when the clicked movie cannot be found', async () => {
		// resultsArray/watchlistArray are both empty, so no movie will match this imdbID
		const result = await handleWatchlistIconClick(createFakeIconTarget('tt9999999'));

		expect(getSpaceSaver).toHaveBeenCalledWith('error');
		expect(result).toBeNull();
		expect(global.localStorage.setItem).not.toHaveBeenCalled();
		expect(renderHtml).not.toHaveBeenCalled();
	});

	it('throws for invalid input when called without an event target at all', async () => {
		await expect(handleWatchlistIconClick(undefined)).rejects.toThrow();
	});
});
