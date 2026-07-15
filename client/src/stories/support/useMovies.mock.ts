import { ref, reactive } from 'vue'
import type { useMovies } from '../../composables/useMovies'
import { sampleFilterOptions, sampleMovies } from './movies.fixtures'

type UseMoviesReturn = ReturnType<typeof useMovies>

export function makeUseMoviesMock(overrides: Partial<UseMoviesReturn> = {}) {
    return {
        movies: ref(sampleMovies),
        filterOptions: reactive(sampleFilterOptions),
        loading: ref(false),
        error: ref(false),
        initialized: ref(true),
        refresh: async () => {},
        refreshMovies: async () => {},
        patchMovieInList: () => {},
        removeMovieFromList: () => {},
        ...overrides,
    }
}
