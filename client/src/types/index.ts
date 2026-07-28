import type { components } from './api'

type KnownKeys<T> = keyof {
    [K in keyof T as string extends K ? never : K]: T[K]
}

export type MovieFull = components['schemas']['MovieFull']
export type MovieKey = KnownKeys<MovieFull>
export type MovieMember = components['schemas']['MovieMember']
export type TMDBSearchResult = components['schemas']['TMDBSearchResult']
export type UserAuthenticated = components['schemas']['Authenticated']
export type UserUnauthenticated = components['schemas']['Unauthenticated']
export type User = components['schemas']['User']

export interface MovieFilters {
    genres: string[]
    decades: number[]
    languages: string[]
    watched: string | null
    director: string | null
    query: string | null
}

export interface MovieView {
    filters: MovieFilters
    view: {
        compact: boolean
    }
}

export type AuthStatus = UserAuthenticated | UserUnauthenticated
