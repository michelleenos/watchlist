import type { MovieFull, TMDBSearchResult } from './types'

export class ApiError extends Error {
    status: number
    statusText: string

    constructor(status: number, statusText: string) {
        super(`${status}: ${statusText}`)
        this.name = 'ApiError'
        this.status = status
        this.statusText = statusText
    }
}

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, opts)
    if (!res.ok) throw new ApiError(res.status, res.statusText)
    return res.json() as Promise<T>
}

function jsonBody(data: unknown): RequestInit {
    return {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }
}

// Movies list + facets
export const getMovies = () => apiFetch<MovieFull[]>('/movies')
export const getGenres = () => apiFetch<string[]>('/genres')
export const getDecades = () => apiFetch<number[]>('/decades')
export const getLanguages = () => apiFetch<string[]>('/languages')

// Single movie
export const getMovie = (id: string | number) => apiFetch<MovieFull>(`/movies/${id}`)

export const patchMovie = (id: string | number, patch: Partial<MovieFull>) =>
    apiFetch<MovieFull>(`/movies/${id}`, { method: 'PATCH', ...jsonBody(patch) })

export const deleteMovie = (id: string | number) =>
    apiFetch<{ success: boolean }>(`/movies/${id}`, { method: 'DELETE' })

// Add movie / TMDB
export const createMovie = (tmdbId: number) =>
    apiFetch<MovieFull>('/movies', { method: 'POST', ...jsonBody({ tmdbId }) })

export const searchTmdb = (name: string) =>
    apiFetch<TMDBSearchResult[]>(`/tmdb/search?name=${encodeURIComponent(name)}`)
