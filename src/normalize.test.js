import { describe, it, expect } from 'vitest';
import { createMovieObject } from './normalize';

describe('createMovieObject', () => {
	it('builds a normalized movie object from OMDB data', () => {
		const rawMovie = {
			Title: "Say Anything",
			imdbID: "tt0098258",
			Ratings: [
				{
					"Source": "Internet Movie Database",
					"Value": "7.3/10"
				},
				{
					"Source": "Rotten Tomatoes",
					"Value": "98%"
				},
				{
					"Source": "Metacritic",
					"Value": "86/100"
				}
			],
			RunTime: "100 min",
			Year: "1989",
			Genre: "Comedy, Drama, Romance",
			Plot: "A noble underachiever and a beautiful valedictorian fall in love the summer before she goes off to college.",
			Poster: "https://m.media-amazon.com/images/M/MV5BNjY1N2QwZDItOWZjZC00MTg4LTg1YmUtZWMzMThhY2YxNmNiXkEyXkFqcGc@._V1_SX300.jpg",
		};
		const result = createMovieObject(rawMovie, true);
		expect(result.title).toBe('Say Anything');
		expect(result.rating).toBe("98%");
		expect(result.watchlist).toBe(true);
	});

	it('falls back to a local icon when poster URL is missing/invalid', () => {
		const rawMovie = {
			Title: 'Unknown Film',
			imdbID: 'tt0000000',
			Poster: 'N/A'
		};
		const result = createMovieObject(rawMovie, false);

		expect(result.thumbnail).toBe('assets/images/film_icon.png');
	});
});
