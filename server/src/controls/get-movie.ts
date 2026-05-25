import { getTmdbImage } from './images.js'
import {
    isLetterboxdMovie,
    isTmdbMovie,
    type MovieErrorType,
    type MovieTypeFull,
    type MovieTypeLetterboxd,
    type MovieTypeTMDB,
} from '../movie-type.js'
import { letterboxdScrape } from './scrape-letterboxd.js'
import { getTmdbData } from './tmdb.js'
import { nanoid } from 'nanoid'

export interface GetMovieOptions {
    getImage?: boolean
    replaceImage?: boolean
    getTmdb?: boolean
    getLetterboxd?: boolean
    letterboxdUrl?: string
    tmdbId?: number
    name: string
}

export const getMovie = async ({
    name,
    getImage = true,
    replaceImage = false,
    getTmdb = true,
    getLetterboxd = true,
    tmdbId,
    letterboxdUrl,
}: GetMovieOptions) => {
    console.log(`\n🔍 Getting data for "${name}"`)

    const errors: string[] = []

    let tmdbMovie: MovieTypeTMDB | MovieErrorType | null = null
    let lbMovie: MovieTypeLetterboxd | MovieErrorType | null = null

    if (getTmdb) {
        tmdbMovie = await getTmdbData(tmdbId || name)
        if (tmdbMovie === null) {
            console.log(`   🛑 OH NO: TMDB for "${name} is null"`)
        } else if ('errors' in tmdbMovie && tmdbMovie.errors.length > 0) {
            console.log(`   🛑 OH NO: TMDB errors for "${name}":`, tmdbMovie.errors)
            errors.push(...tmdbMovie.errors)
        }
    }

    if (getLetterboxd) {
        lbMovie = await letterboxdScrape(name, letterboxdUrl)
        if (lbMovie === null) {
            console.log(`   🛑 OH NO: Letterboxd returned null for "${name}`)
        } else if ('errors' in lbMovie && lbMovie.errors.length > 0) {
            console.log(`   🛑 OH NO: Letterboxd errors for "${name}":`, lbMovie.errors)
            errors.push(...lbMovie.errors)
        }
    }

    if (
        (lbMovie && lbMovie.name !== name) ||
        (tmdbMovie && tmdbMovie.name !== name) ||
        (tmdbMovie && lbMovie && tmdbMovie.name !== lbMovie.name)
    ) {
        errors.push(
            `Name mismatch: input "${name}", ${lbMovie ? `LB "${lbMovie.name}"` : ''} ${tmdbMovie ? `TMDB "${tmdbMovie.name}"` : ''}`.trim(),
        )
    }

    const genresSet = new Set<string>()
    if (isTmdbMovie(tmdbMovie) && tmdbMovie.tmdbGenres) {
        tmdbMovie.tmdbGenres.forEach((g) => genresSet.add(g))
    }
    if (isLetterboxdMovie(lbMovie) && lbMovie.letterboxdGenres) {
        lbMovie.letterboxdGenres.forEach((g) => genresSet.add(g))
    }
    const genres = Array.from(genresSet)

    const movieFull: MovieTypeFull = {
        name,
        id: nanoid(),
        ...(lbMovie || {}),
        ...(tmdbMovie || {}),
        genres,
        errors,
    }

    if (isTmdbMovie(tmdbMovie) && getImage) {
        const getPosterResult = await getTmdbImage(tmdbMovie, replaceImage)
        if ('error' in getPosterResult) {
            movieFull.errors.push(getPosterResult.error)
        } else {
            movieFull.posterPath = getPosterResult.path
        }
    }

    return movieFull
}

export const getMovieTmdb = async (tmdbId: number, { replaceImage = false } = {}) => {
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
