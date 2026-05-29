import { getMovies } from './movies.js'


export async function getGenres() {
	const movies = await getMovies()
	const genres = new Set<string>()
	movies.forEach((movie)=> {
		movie.genres?.forEach((g) => genres.add(g.toLowerCase()))
	})
	return [...genres]
}
