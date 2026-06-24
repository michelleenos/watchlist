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
    genres?: string[]
    description?: string
    originalTitle?: string
    tmdbId: number
    errors: string[]
}

export interface MovieErrorType {
    name: string
    errors: string[]
}

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface MovieTypeFull extends MakeOptional<MovieTypeTMDB, 'tmdbId'> {
    id: string
    errors: string[]
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
