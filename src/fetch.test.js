import { describe, it, expect, vi, beforeEach } from 'vitest';

import { fetchFuzzy, fetchFromImdbId, toMovieArray } from './fetch.js';

beforeEach(() => {
	vi.clearAllMocks();
	global.fetch = vi.fn();
});

describe('fetchFuzzy', () => {
	it('resolves with the parsed JSON body (a Search array) for a normal lookup', async () => {
		const results = { Response: 'True', Search: [{ Title: 'Say Anything', imdbID: 'tt0098258' }] };
		global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(results) });

		const result = await fetchFuzzy('Say Anything');

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?s=Say Anything&apikey='));
		expect(result).toEqual(results);
	});

	it('resolves with a "not found" style payload when nothing matches', async () => {
		const noMatch = { Response: 'False', Error: 'Movie not found!' };
		global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(noMatch) });

		const result = await fetchFuzzy('asdkjhaslkdjh');

		expect(result).toEqual(noMatch);
	});

	it('rejects when the network request fails', async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(fetchFuzzy('Say Anything')).rejects.toThrow();
	});

	it('rejects when the response is not ok', async () => {
		global.fetch.mockResolvedValue({ ok: false, status: 500 });

		await expect(fetchFuzzy('Say Anything')).rejects.toThrow('Fetch failed: 500');
	});

	it('still builds and sends a request when called with invalid/undefined input', async () => {
		global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ Response: 'False' }) });

		await fetchFuzzy(undefined);

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?s=undefined&apikey='));
	});
});

describe('fetchFromImdbId', () => {
	it('resolves with the parsed JSON body for a normal lookup by imdbID', async () => {
		const movie = { Title: 'Say Anything', imdbID: 'tt0098258', Response: 'True' };
		global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(movie) });

		const result = await fetchFromImdbId('tt0098258');

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?i=tt0098258&apikey='));
		expect(result).toEqual(movie);
	});

	it('resolves with a "not found" style payload for an imdbID with no match', async () => {
		const noMatch = { Response: 'False', Error: 'Incorrect IMDb ID.' };
		global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(noMatch) });

		const result = await fetchFromImdbId('tt0000000');

		expect(result).toEqual(noMatch);
	});

	it('rejects when the network request fails', async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(fetchFromImdbId('tt0098258')).rejects.toThrow();
	});

	it('rejects when the response is not ok', async () => {
		global.fetch.mockResolvedValue({ ok: false, status: 404 });

		await expect(fetchFromImdbId('tt0098258')).rejects.toThrow('Fetch failed: 404');
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
		global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(movie) });

		const result = await fetchExact('Say Anything');

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?t=Say Anything&apikey='));
		expect(result).toEqual(movie);
	});

	it('resolves with a "not found" style payload when the exact title has no match', async () => {
		const noMatch = { Response: 'False', Error: 'Movie not found!' };
		global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(noMatch) });

		const result = await fetchExact('asdkjhaslkdjh');

		expect(result).toEqual(noMatch);
	});

	it('rejects when the network request fails', async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(fetchExact('Say Anything')).rejects.toThrow();
	});

	it('rejects when the response is not ok', async () => {
		global.fetch.mockResolvedValue({ ok: false, status: 500 });

		await expect(fetchExact('Say Anything')).rejects.toThrow('Fetch failed: 500');
	});

	it('still builds and sends a request when called with invalid/undefined input', async () => {
		global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ Response: 'False' }) });

		await fetchExact(undefined);

		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://omdbapi.com/?t=undefined&apikey='));
	});
});
