export interface MovieTypeLetterboxd {
    name: string
    letterboxdUrl: string
    letterboxdDescription?: string
    tagline?: string
    letterboxdGenres?: string[]
    themes?: string[]
    errors: string[]
    director?: string
}

export interface MovieTypeTMDB {
    name: string
    year?: number
    crew?: { name: string; role: string }[]
    cast?: { name: string; role: string }[]
    language?: string
    tmdbPopularity?: number
    tmdbVoteAverage?: number
    tmdbVoteCount?: number
    tmdbPosterPath?: string
    tagline?: string
    tmdbGenres?: string[]
    tmdbOverview?: string
    originalTitle?: string
    tmdbId: number
    errors: string[]
}

export interface MovieErrorType {
    name: string
    errors: string[]
}

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface MovieTypeFull
    extends MakeOptional<MovieTypeTMDB, 'tmdbId'>,
        MakeOptional<MovieTypeLetterboxd, 'letterboxdUrl'> {
    errors: string[]
    genres?: string[]
    posterPath?: string
}

export const isTmdbMovie = (
    movie: MovieTypeTMDB | MovieErrorType | null,
): movie is MovieTypeTMDB => {
    if (!movie) return false
    return (movie as MovieTypeTMDB).tmdbId !== undefined
}

export const isLetterboxdMovie = (
    movie: MovieTypeLetterboxd | MovieErrorType | null,
): movie is MovieTypeLetterboxd => {
    if (!movie) return false
    return (movie as MovieTypeLetterboxd).letterboxdUrl !== undefined
}
