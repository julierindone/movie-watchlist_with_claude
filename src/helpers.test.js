import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./search.js', () => ({
	resultsArray: [],
}));

import { resultsArray } from './search.js';
import { resetAll, getSpaceSaver, toggleMainSection } from './helpers.js';

function createFakeElement() {
	return {
		innerHTML: '',
		classList: { add: vi.fn(), remove: vi.fn() },
	};
}

let mainWrapperEl;
let mainEl;

beforeEach(() => {
	vi.clearAllMocks();
	resultsArray.length = 0;

	mainWrapperEl = createFakeElement();
	mainEl = createFakeElement();
	global.main = createFakeElement();
	global.document = {
		getElementById: vi.fn(id => (id === 'main-wrapper' ? mainWrapperEl : id === 'main' ? mainEl : null)),
	};
});

describe('resetAll', () => {
	it('clears resultsArray and empties the main-wrapper markup for a normal reset', () => {
		resultsArray.push({ imdbID: 'tt0098258' }, { imdbID: 'tt0000001' });
		mainWrapperEl.innerHTML = '<article class="movie-card">old content</article>';

		resetAll();

		expect(resultsArray).toHaveLength(0);
		expect(mainWrapperEl.innerHTML).toBe('');
	});

	it('safely resets when resultsArray is already empty (no prior results/no-match state)', () => {
		expect(resultsArray).toHaveLength(0);

		resetAll();

		expect(resultsArray).toHaveLength(0);
		expect(mainWrapperEl.innerHTML).toBe('');
	});

	it('throws for an invalid DOM state where the main-wrapper element cannot be found', () => {
		global.document.getElementById = vi.fn(() => null);

		expect(() => resetAll()).toThrow();
	});
});

describe('getSpaceSaver', () => {
	it('renders the empty-watchlist message and switches to the space-saver layout for a normal "watchlist" status', () => {
		getSpaceSaver('watchlist');

		expect(mainEl.innerHTML).toContain('your watchlist is empty');
		expect(mainEl.innerHTML).toContain('search page');
		expect(global.main.classList.add).toHaveBeenCalledWith('space-saver');
		expect(mainWrapperEl.classList.remove).toHaveBeenCalledWith('card-wrapper');
	});

	it('renders the "no matches" message when a search comes back with no results', () => {
		getSpaceSaver('no_matches');

		expect(mainEl.innerHTML).toContain("couldn't find that title");
		expect(mainEl.innerHTML).not.toContain('your watchlist is empty');
	});

	it('renders the generic failure message for a status representing a broken connection/failed request', () => {
		getSpaceSaver('error');

		expect(mainEl.innerHTML).toContain('Something went wrong');
	});

	it('falls back to the generic failure message for invalid/unrecognized input (e.g. no status given)', () => {
		getSpaceSaver(undefined);

		expect(mainEl.innerHTML).toContain('Something went wrong');
	});

	it('throws for an invalid DOM state where the main element cannot be found', () => {
		global.document.getElementById = vi.fn(id => (id === 'main-wrapper' ? mainWrapperEl : null));

		expect(() => getSpaceSaver('watchlist')).toThrow();
	});
});

describe('toggleMainSection', () => {
	it('switches to the list layout by default when called with no arguments', () => {
		toggleMainSection();

		expect(mainWrapperEl.classList.add).toHaveBeenCalledWith('card-wrapper');
		expect(global.main.classList.remove).toHaveBeenCalledWith('space-saver');
	});

	it('switches to the space-saver layout for an empty/no-results view when explicitly requested', () => {
		toggleMainSection('space-saver');

		expect(global.main.classList.add).toHaveBeenCalledWith('space-saver');
		expect(mainWrapperEl.classList.remove).toHaveBeenCalledWith('card-wrapper');
	});

	it('treats an unrecognized goal value the same as the list default (invalid input)', () => {
		toggleMainSection('not-a-real-goal');

		expect(mainWrapperEl.classList.add).toHaveBeenCalledWith('card-wrapper');
		expect(global.main.classList.remove).toHaveBeenCalledWith('space-saver');
	});

	it('throws for an invalid/broken DOM state where the main-wrapper element cannot be found', () => {
		global.document.getElementById = vi.fn(() => null);

		expect(() => toggleMainSection('space-saver')).toThrow();
	});
});
