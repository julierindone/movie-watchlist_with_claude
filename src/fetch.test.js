import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./helpers.js', () => ({
	getSpaceSaver: vi.fn(),
}));

vi.mock('./render.js', () => ({
	generateAddDetailsToWatchlistItemError: vi.fn(),
	generateMoreDetailsError: vi.fn(),
}));

import { getSpaceSaver } from './helpers.js';
import { generateAddDetailsToWatchlistItemError, generateMoreDetailsError } from './render.js';
import { fetchFuzzy, fetchFromImdbId, toMovieArray } from './fetch.js';

beforeEach(() => {
	vi.clearAllMocks();
	global.fetch = vi.fn();
});

describe('fetchFuzzy', () => {
	it('resolves with the parsed JSON body (a Search array) for a normal lookup', async () => {
		const results = { Response: 'True', Search: [{ Title: 'Say Anything', imdbID: 'tt0098258' }] };
		global.fetch.mockResolvedValue({ json: () => Promise.resolve(results) });

		const result = await fetchFuzzy('Say Anything');

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?s=Say Anything&apikey='));
		expect(result).toEqual(results);
	});

	it('resolves with a "not found" style payload when nothing matches', async () => {
		const noMatch = { Response: 'False', Error: 'Movie not found!' };
		global.fetch.mockResolvedValue({ json: () => Promise.resolve(noMatch) });

		const result = await fetchFuzzy('asdkjhaslkdjh');

		expect(result).toEqual(noMatch);
	});

	it('logs the error and triggers the space-saver error state when the network request fails', async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await fetchFuzzy('Say Anything');

		expect(getSpaceSaver).toHaveBeenCalledWith('error');
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it('still builds and sends a request when called with invalid/undefined input', async () => {
		global.fetch.mockResolvedValue({ json: () => Promise.resolve({ Response: 'False' }) });

		await fetchFuzzy(undefined);

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?s=undefined&apikey='));
	});
});

describe('fetchFromImdbId', () => {
	function createFakeErrorTarget(isDetailsDiv) {
		return {
			classList: { contains: vi.fn(className => isDetailsDiv && className === 'details-div') },
		};
	}

	it('resolves with the parsed JSON body for a normal lookup by imdbID', async () => {
		const movie = { Title: 'Say Anything', imdbID: 'tt0098258', Response: 'True' };
		global.fetch.mockResolvedValue({ json: () => Promise.resolve(movie) });

		const result = await fetchFromImdbId('tt0098258', createFakeErrorTarget(false));

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?i=tt0098258&apikey='));
		expect(result).toEqual(movie);
	});

	it('resolves with a "not found" style payload for an imdbID with no match', async () => {
		const noMatch = { Response: 'False', Error: 'Incorrect IMDb ID.' };
		global.fetch.mockResolvedValue({ json: () => Promise.resolve(noMatch) });

		const result = await fetchFromImdbId('tt0000000', createFakeErrorTarget(false));

		expect(result).toEqual(noMatch);
	});

	it('renders the watchlist-item error UI when the error target is a details-div and the request fails', async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const detailsDiv = createFakeErrorTarget(true);

		const result = await fetchFromImdbId('tt0098258', detailsDiv);

		expect(generateAddDetailsToWatchlistItemError).toHaveBeenCalledWith(detailsDiv);
		expect(generateMoreDetailsError).not.toHaveBeenCalled();
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it('renders the generic more-details error UI when the error target is not a details-div and the request fails', async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const summaryEl = createFakeErrorTarget(false);

		const result = await fetchFromImdbId('tt0098258', summaryEl);

		expect(generateMoreDetailsError).toHaveBeenCalledWith(summaryEl);
		expect(generateAddDetailsToWatchlistItemError).not.toHaveBeenCalled();
		expect(result).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it('throws for invalid input (no error target element to inspect) when the request fails', async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		await expect(fetchFromImdbId('tt0098258', undefined)).rejects.toThrow();
		consoleSpy.mockRestore();
	});
});

describe('toMovieArray', () => {
	it('wraps a single exact-match movie object in an array', () => {
		const movie = { Title: 'Say Anything', imdbID: 'tt0098258' };
		expect(toMovieArray('exact', movie)).toEqual([movie]);
	});

	it('returns the Search array for a fuzzy search result', () => {
		const data = { Search: [{ Title: 'Say Anything' }, { Title: 'Say Anything Else' }] };
		expect(toMovieArray('fuzzy', data)).toBe(data.Search);
	});

	it('returns undefined for a fuzzy search with no Search property (no matches found)', () => {
		expect(toMovieArray('fuzzy', {})).toBeUndefined();
	});

	it('throws for invalid input where data is missing entirely', () => {
		expect(() => toMovieArray('fuzzy', undefined)).toThrow();
	});
});

import { fetchExact } from './fetch.js';

describe('fetchExact', () => {
	it('resolves with the parsed JSON body for a normal exact-title lookup', async () => {
		const movie = { Title: 'Say Anything', imdbID: 'tt0098258', Response: 'True' };
		global.fetch.mockResolvedValue({ json: () => Promise.resolve(movie) });

		const result = await fetchExact('Say Anything');

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?t=Say Anything&apikey='));
		expect(result).toEqual(movie);
	});

	it('resolves with a "not found" style payload when the exact title has no match', async () => {
		const noMatch = { Response: 'False', Error: 'Movie not found!' };
		global.fetch.mockResolvedValue({ json: () => Promise.resolve(noMatch) });

		const result = await fetchExact('asdkjhaslkdjh');

		expect(result).toEqual(noMatch);
	});

	it('logs the error and triggers the space-saver error state when the network request fails', async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await fetchExact('Say Anything');

		expect(getSpaceSaver).toHaveBeenCalledWith('error');
		expect(consoleSpy).toHaveBeenCalled();
		expect(result).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it('still builds and sends a request when called with invalid/undefined input', async () => {
		global.fetch.mockResolvedValue({ json: () => Promise.resolve({ Response: 'False' }) });

		await fetchExact(undefined);

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?t=undefined&apikey='));
	});
});
