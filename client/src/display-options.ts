export interface MovieDisplayOptions {
    description: boolean
    genres: boolean
    poster: boolean
    tagline?: boolean
    errors?: boolean
    tmdbScores?: boolean
    themes?: boolean
}

export const defaultDisplayOptions: MovieDisplayOptions = {
    description: true,
    tagline: true,
    genres: true,
    poster: true,
    errors: false,
    tmdbScores: false,
    themes: false,
}
