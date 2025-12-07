import { getTmdbImage } from './images'
import {
    isLetterboxdMovie,
    isTmdbMovie,
    type MovieErrorType,
    type MovieTypeFull,
    type MovieTypeLetterboxd,
    type MovieTypeTMDB,
} from '../movie-type'
import { letterboxdScrape } from './scrape-letterboxd'
import { getTmdbData } from './tmdb'

export interface GetMovieOptions {
    getImage?: boolean
    replaceImage?: boolean
    getTmdb?: boolean
    getLetterboxd?: boolean
    tmdbId?: number
    letterboxdUrl?: string
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

    let lbMovie: MovieTypeLetterboxd | MovieErrorType | null = null
    let tmdbMovie: MovieTypeTMDB | MovieErrorType | null = null

    if (getLetterboxd) {
        lbMovie = await letterboxdScrape(name, letterboxdUrl)
        if ('errors' in lbMovie && lbMovie.errors.length > 0) {
            console.log(`   🛑 OH NO: Letterboxd errors for "${name}":`, lbMovie.errors)
            errors.push(...lbMovie.errors)
        }
    }

    if (getTmdb) {
        tmdbMovie = await getTmdbData(tmdbId || name)
        if ('errors' in tmdbMovie && tmdbMovie.errors.length > 0) {
            console.log(`   🛑 OH NO: TMDB errors for "${name}":`, tmdbMovie.errors)
            errors.push(...tmdbMovie.errors)
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

    if (isTmdbMovie(tmdbMovie) && isLetterboxdMovie(lbMovie)) {
        if (
            tmdbMovie.tmdbOverview &&
            lbMovie.letterboxdDescription &&
            tmdbMovie.tmdbOverview !== lbMovie.letterboxdDescription
        ) {
            errors.push(`Mismatched descriptions`)
        }
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
