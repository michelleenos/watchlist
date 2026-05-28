export interface MovieTypeLetterboxd {
    name: string
    letterboxdUrl: string
    // letterboxdDescription?: string
    letterboxdGenres?: string[]
    themes?: string[]
    director?: string
    errors: string[]
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
    id: string
    errors: string[]
    genres?: string[]
    posterPath?: string
}

export const isTmdbMovie = (
    movie: MovieTypeTMDB | MovieErrorType | null,
): movie is MovieTypeTMDB => {
    if (!movie) return false
    if (typeof (movie as MovieTypeTMDB).tmdbId !== 'number') return false
    if (typeof (movie as MovieTypeTMDB).name !== 'string') return false
    return true
}

export const isLetterboxdMovie = (
    movie: MovieTypeLetterboxd | MovieErrorType | null,
): movie is MovieTypeLetterboxd => {
    if (!movie) return false
    return (movie as MovieTypeLetterboxd).letterboxdUrl !== undefined
}
