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

// From here down: tests for the persistent sort/filter and watched/unwatched toggle
// feature. These re-mock './helpers.js' (last registration wins in Vitest) so that
// getStoredPreference/setStoredPreference run for real against the fake localStorage
// above, while getSpaceSaver stays mocked like the rest of this file.
vi.mock('./helpers.js', async (importOriginal) => {
	const actualHelpers = await importOriginal();
	return {
		...actualHelpers,
		getSpaceSaver: vi.fn(),
	};
});

import {
	handleWatchedIconClick,
	getStoredSortPreference,
	handleSortChange,
	getStoredGenreFilter,
	handleFilterChange,
	getStoredWatchedFilter,
	handleWatchedFilterChange,
	getFilteredWatchlistArray,
	populateGenreFilterOptions,
} from './watchlist.js';

describe('handleWatchedIconClick', () => {
	it('toggles watched status from unwatched to watched, persists it, and re-renders for a normal click', () => {
		const movie = createFullMovie('tt0098258');
		movie.watched = false;
		watchlistArray.push(movie);

		handleWatchedIconClick(createFakeIconTarget('tt0098258'));

		expect(watchlistArray[0].watched).toBe(true);
		expect(global.localStorage.setItem).toHaveBeenCalledWith('watchlist', JSON.stringify(watchlistArray));
		expect(renderHtml).toHaveBeenCalled();
	});

	it('toggles watched status back to false when an already-watched movie is clicked again', () => {
		const movie = createFullMovie('tt0098258');
		movie.watched = true;
		watchlistArray.push(movie);

		handleWatchedIconClick(createFakeIconTarget('tt0098258'));

		expect(watchlistArray[0].watched).toBe(false);
	});

	it('shows the space-saver error state and does not persist/render when the clicked movie is not on the watchlist (no match)', () => {
		const result = handleWatchedIconClick(createFakeIconTarget('tt9999999'));

		expect(getSpaceSaver).toHaveBeenCalledWith('error');
		expect(result).toBeNull();
		expect(global.localStorage.setItem).not.toHaveBeenCalled();
		expect(renderHtml).not.toHaveBeenCalled();
	});

	it('propagates the error instead of finishing the update when persisting the toggled watchlist to localStorage fails', () => {
		const movie = createFullMovie('tt0098258');
		movie.watched = false;
		watchlistArray.push(movie);
		global.localStorage.setItem = vi.fn(() => { throw new Error('QuotaExceededError'); });

		expect(() => handleWatchedIconClick(createFakeIconTarget('tt0098258'))).toThrow();
		// the in-memory toggle already happened before the failed persistence attempt
		expect(watchlistArray[0].watched).toBe(true);
	});

	it('throws for invalid input when called without an event target at all (with a movie present so the lookup callback actually runs)', () => {
		watchlistArray.push(createFullMovie('tt0098258'));

		expect(() => handleWatchedIconClick(undefined)).toThrow();
	});
});

describe('getStoredSortPreference', () => {
	it('returns the previously saved sort choice for a normal call', () => {
		global.localStorage.store.watchlistSort = 'rating';

		expect(getStoredSortPreference()).toBe('rating');
	});

	it('defaults to "title" when no sort preference has been saved yet (empty/no-match result)', () => {
		expect(getStoredSortPreference()).toBe('title');
	});

	it('propagates the error when localStorage itself throws on read (e.g. storage disabled)', () => {
		global.localStorage.getItem = vi.fn(() => { throw new Error('storage disabled'); });

		expect(() => getStoredSortPreference()).toThrow();
	});

	it('returns whatever invalid/unrecognized string was stored under the sort key, unvalidated', () => {
		global.localStorage.store.watchlistSort = 'not-a-real-sort-type';

		expect(getStoredSortPreference()).toBe('not-a-real-sort-type');
	});
});

describe('handleSortChange', () => {
	function fakeMovie(imdbID, title, year, rating) {
		return { imdbID, title, year, rating, genre: '' };
	}

	it('sorts the watchlist alphabetically by title, persists the choice, and re-renders for a normal "title" sort', () => {
		watchlistArray.push(fakeMovie('tt1', 'Zoolander', '2001', '65%'), fakeMovie('tt2', 'Anchorman', '2004', '66%'));

		handleSortChange('title');

		expect(watchlistArray.map(m => m.imdbID)).toEqual(['tt2', 'tt1']);
		expect(global.localStorage.setItem).toHaveBeenCalledWith('watchlistSort', 'title');
		expect(renderHtml).toHaveBeenCalled();
	});

	it('sorts the watchlist by year, newest first, for a "year" sort', () => {
		watchlistArray.push(fakeMovie('tt1', 'A', '1990', '50%'), fakeMovie('tt2', 'B', '2020', '60%'));

		handleSortChange('year');

		expect(watchlistArray.map(m => m.imdbID)).toEqual(['tt2', 'tt1']);
	});

	it('sorts the watchlist by rating, highest first, for a "rating" sort', () => {
		watchlistArray.push(fakeMovie('tt1', 'A', '1990', '40%'), fakeMovie('tt2', 'B', '2020', '90%'));

		handleSortChange('rating');

		expect(watchlistArray.map(m => m.imdbID)).toEqual(['tt2', 'tt1']);
	});

	it('leaves an empty watchlist empty instead of erroring (empty/no-match case)', () => {
		expect(watchlistArray).toHaveLength(0);

		expect(() => handleSortChange('title')).not.toThrow();
		expect(watchlistArray).toHaveLength(0);
	});

	it('propagates the error when persisting the chosen sort type to localStorage fails', () => {
		watchlistArray.push(fakeMovie('tt1', 'A', '1990', '40%'));
		global.localStorage.setItem = vi.fn(() => { throw new Error('storage disabled'); });

		expect(() => handleSortChange('title')).toThrow();
	});

	it('leaves the watchlist order unchanged for an invalid/unrecognized sort type', () => {
		watchlistArray.push(fakeMovie('tt1', 'Zoolander', '2001', '65%'), fakeMovie('tt2', 'Anchorman', '2004', '66%'));

		handleSortChange('not-a-real-sort-type');

		expect(watchlistArray.map(m => m.imdbID)).toEqual(['tt1', 'tt2']);
	});
});

describe('getStoredGenreFilter', () => {
	it('returns the previously saved genre for a normal call', () => {
		global.localStorage.store.watchlistGenreFilter = 'Comedy';

		expect(getStoredGenreFilter()).toBe('Comedy');
	});

	it('defaults to "all" when no genre filter has been saved yet (empty/no-match result)', () => {
		expect(getStoredGenreFilter()).toBe('all');
	});

	it('propagates the error when localStorage throws on read', () => {
		global.localStorage.getItem = vi.fn(() => { throw new Error('storage disabled'); });

		expect(() => getStoredGenreFilter()).toThrow();
	});

	it('returns an invalid/no-longer-existing genre string as-is without validating it against the watchlist', () => {
		global.localStorage.store.watchlistGenreFilter = 'NotARealGenre';

		expect(getStoredGenreFilter()).toBe('NotARealGenre');
	});
});

describe('handleFilterChange', () => {
	it('persists the chosen genre filter and re-renders for a normal call', () => {
		handleFilterChange('Comedy');

		expect(global.localStorage.setItem).toHaveBeenCalledWith('watchlistGenreFilter', 'Comedy');
		expect(renderHtml).toHaveBeenCalled();
		expect(getStoredGenreFilter()).toBe('Comedy');
	});

	it('persists "all" the same way when the reset/"All Genres" option is chosen', () => {
		handleFilterChange('all');

		expect(getStoredGenreFilter()).toBe('all');
	});

	it('propagates the error when persisting the genre filter to localStorage fails', () => {
		global.localStorage.setItem = vi.fn(() => { throw new Error('storage disabled'); });

		expect(() => handleFilterChange('Comedy')).toThrow();
	});

	it('stores and returns an invalid genre value without validating it against real genres', () => {
		handleFilterChange(12345);

		expect(getStoredGenreFilter()).toBe(12345);
	});
});

describe('getStoredWatchedFilter', () => {
	it('returns the previously saved watched-status filter for a normal call', () => {
		global.localStorage.store.watchlistWatchedFilter = 'watched';

		expect(getStoredWatchedFilter()).toBe('watched');
	});

	it('defaults to "all" when no watched filter has been saved yet (empty/no-match result)', () => {
		expect(getStoredWatchedFilter()).toBe('all');
	});

	it('propagates the error when localStorage throws on read', () => {
		global.localStorage.getItem = vi.fn(() => { throw new Error('storage disabled'); });

		expect(() => getStoredWatchedFilter()).toThrow();
	});

	it('returns an invalid/unrecognized filter value as-is without validating it', () => {
		global.localStorage.store.watchlistWatchedFilter = 'not-a-real-status';

		expect(getStoredWatchedFilter()).toBe('not-a-real-status');
	});
});

describe('handleWatchedFilterChange', () => {
	it('persists the chosen watched-status filter and re-renders for a normal call', () => {
		handleWatchedFilterChange('unwatched');

		expect(global.localStorage.setItem).toHaveBeenCalledWith('watchlistWatchedFilter', 'unwatched');
		expect(renderHtml).toHaveBeenCalled();
		expect(getStoredWatchedFilter()).toBe('unwatched');
	});

	it('persists "all" the same way when the reset/no-filter option is chosen', () => {
		handleWatchedFilterChange('all');

		expect(getStoredWatchedFilter()).toBe('all');
	});

	it('propagates the error when persisting the watched filter to localStorage fails', () => {
		global.localStorage.setItem = vi.fn(() => { throw new Error('storage disabled'); });

		expect(() => handleWatchedFilterChange('watched')).toThrow();
	});

	it('stores and returns an invalid/unrecognized value without validating it', () => {
		handleWatchedFilterChange('sideways');

		expect(getStoredWatchedFilter()).toBe('sideways');
	});
});

describe('getFilteredWatchlistArray', () => {
	function fakeMovie(imdbID, genre, watched) {
		return { imdbID, genre, watched, title: imdbID };
	}

	it('returns only movies matching both the saved genre and watched filters for a normal call', () => {
		watchlistArray.push(
			fakeMovie('tt1', 'Comedy', true),
			fakeMovie('tt2', 'Drama', true),
			fakeMovie('tt3', 'Comedy', false)
		);
		global.localStorage.store.watchlistGenreFilter = 'Comedy';
		global.localStorage.store.watchlistWatchedFilter = 'watched';

		const filtered = getFilteredWatchlistArray();

		expect(filtered.map(m => m.imdbID)).toEqual(['tt1']);
	});

	it('returns an empty array when nothing in the watchlist matches the combined filters (empty/no-match result)', () => {
		watchlistArray.push(fakeMovie('tt1', 'Comedy', true));
		global.localStorage.store.watchlistGenreFilter = 'Horror';

		const filtered = getFilteredWatchlistArray();

		expect(filtered).toEqual([]);
	});

	it('propagates the error when reading the saved filters from localStorage fails', () => {
		watchlistArray.push(fakeMovie('tt1', 'Comedy', true));
		global.localStorage.getItem = vi.fn(() => { throw new Error('storage disabled'); });

		expect(() => getFilteredWatchlistArray()).toThrow();
	});

	it('excludes a watchlist entry with a missing/invalid genre value when a specific genre filter is active (invalid input)', () => {
		watchlistArray.push(fakeMovie('tt1', undefined, true));
		global.localStorage.store.watchlistGenreFilter = 'Comedy';

		const filtered = getFilteredWatchlistArray();

		expect(filtered).toEqual([]);
	});
});

describe('populateGenreFilterOptions', () => {
	function createFakeSelect() {
		return { innerHTML: '', value: '' };
	}

	it('builds the genre dropdown from genres present in the watchlist and restores a still-valid saved genre for a normal call', () => {
		watchlistArray.push(createFullMovie('tt1'), { imdbID: 'tt2', genre: 'Action, Thriller' });
		const filterSelect = createFakeSelect();
		global.localStorage.store.watchlistGenreFilter = 'Action';
		global.document.getElementById = vi.fn(id => (id === 'genre-filter-select' ? filterSelect : null));

		populateGenreFilterOptions();

		expect(filterSelect.innerHTML).toContain('All Genres');
		expect(filterSelect.innerHTML).toContain('Action');
		expect(filterSelect.innerHTML).toContain('Comedy');
		expect(filterSelect.value).toBe('Action');
	});

	it('does nothing and does not throw when the genre filter dropdown is not present on the page (e.g. search page, not watchlist page)', () => {
		global.document.getElementById = vi.fn(() => null);

		expect(() => populateGenreFilterOptions()).not.toThrow();
	});

	it('propagates the error when reading the saved genre filter from localStorage fails', () => {
		watchlistArray.push(createFullMovie('tt1'));
		const filterSelect = createFakeSelect();
		global.document.getElementById = vi.fn(id => (id === 'genre-filter-select' ? filterSelect : null));
		global.localStorage.getItem = vi.fn(() => { throw new Error('storage disabled'); });

		expect(() => populateGenreFilterOptions()).toThrow();
	});

	it('falls back to "all" and persists that fallback when the previously saved genre no longer exists in the watchlist (invalid/stale input)', () => {
		watchlistArray.push(createFullMovie('tt1')); // genres: Comedy, Drama, Romance
		const filterSelect = createFakeSelect();
		global.localStorage.store.watchlistGenreFilter = 'Horror'; // no longer present
		global.document.getElementById = vi.fn(id => (id === 'genre-filter-select' ? filterSelect : null));

		populateGenreFilterOptions();

		expect(filterSelect.value).toBe('all');
		expect(global.localStorage.setItem).toHaveBeenCalledWith('watchlistGenreFilter', 'all');
	});
});
