import { nanoid } from 'nanoid'
import { isTmdbMovie, type MovieTypeFull } from '../movie-type.js'
import { getTmdbImage } from './images.js'
import { getTmdbData } from './tmdb.js'

export const getTmdbMovie = async (tmdbId: number, { replaceImage = false } = {}) => {
    const tmdbMovie = await getTmdbData(tmdbId)

    if (!isTmdbMovie(tmdbMovie)) {
        throw new Error(`issue retrieving tmdb movie: ${tmdbMovie.errors.join(', ')}`)
    }

    const newMovieData: MovieTypeFull = {
        ...tmdbMovie,
        id: nanoid(),
    }

    const getPosterResult = await getTmdbImage(tmdbMovie, replaceImage)
    if ('error' in getPosterResult) {
        newMovieData.errors.push(getPosterResult.error)
    } else {
        newMovieData.posterPath = getPosterResult.path
    }

    return newMovieData
}
