import type { components } from './api'

export type MovieFull = components['schemas']['MovieFull']
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
}

export interface MovieView {
    filters: MovieFilters
    compactView: boolean
}

export type AuthStatus = UserAuthenticated | UserUnauthenticated
