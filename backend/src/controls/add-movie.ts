import { getCurrentMovies, updateData } from '../utils.js'
import { getMovie, getMovieTmdb } from './get-movie.js'

export const addMovie = async (name: string, tmdbId?: number) => {
    const movie = await getMovie({
        name,
        tmdbId,
        getLetterboxd: false,
    })

    const currentMovies = await getCurrentMovies()
    const newMovies = [...currentMovies, movie]

    await updateData(JSON.stringify(newMovies, null, 2), 'movies.json')

    return movie
}

export const addMovieFromTmdb = async (tmdbId: number) => {
    const movie = await getMovieTmdb(tmdbId)
    const currentMovies = await getCurrentMovies()
    const newMovies = [...currentMovies, movie].sort((a, b) => {
        return a.name.localeCompare(b.name)
    })

    console.log('updating movies.json')

    await updateData(JSON.stringify(newMovies, null, 2), 'movies.json')

    return movie
}
