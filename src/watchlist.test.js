import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./search.js', () => ({
	resultsArray: [],
}));

vi.mock('./render.js', () => ({
	generateAddDetailsToWatchlistItemError: vi.fn(),
	renderHtml: vi.fn(),
}));

import { resultsArray } from './search.js';
import { renderHtml } from './render.js';
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
		expect(renderHtml).toHaveBeenCalledWith(resultsArray, watchlistArray);
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
