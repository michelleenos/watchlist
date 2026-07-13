import { ref } from 'vue'
import type { useMovies } from '../../composables/useMovies'
import { sampleFilterOptions, sampleMovies } from './movies.fixtures'

type UseMoviesReturn = ReturnType<typeof useMovies>

export function makeUseMoviesMock(overrides: Partial<UseMoviesReturn> = {}) {
    return {
        moviesData: { movies: sampleMovies, ...sampleFilterOptions },
        loading: ref(false),
        error: ref(false),
        refresh: async () => {},
        ...overrides,
    }
}
