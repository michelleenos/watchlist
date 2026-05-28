import { getTmdbMovie } from '../external/get-movie.js'
import { addMovie } from '../repositories/movies.js'

export const addMovieFromTmdb = async (tmdbId: number) => {
    const movie = await getTmdbMovie(tmdbId)
    await addMovie(movie)
    return movie
}
