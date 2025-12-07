export interface MovieDisplayOptions {
    description: boolean
    genres: boolean
    poster: boolean
    tagline?: boolean
    lbDescription?: boolean
    errors?: boolean
    tmdbScores?: boolean
    themes?: boolean
}

export const defaultDisplayOptions: MovieDisplayOptions = {
    description: true,
    tagline: true,
    lbDescription: false,
    genres: true,
    poster: true,
    errors: false,
    tmdbScores: false,
    themes: false,
}
