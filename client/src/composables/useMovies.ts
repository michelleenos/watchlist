import { reactive, ref } from 'vue'
import type { MovieFull } from '../types'
import { getMovies, getGenres, getDecades, getLanguages } from '../api'

const movies = ref<MovieFull[]>([])

const filterOptions = reactive<{
    genres: string[]
    decades: { value: number; label: string }[]
    languages: string[]
}>({
    genres: [],
    decades: [],
    languages: [],
})

const loading = ref(false)
const error = ref(false)
// True once the first load has settled (success or error). Distinct from
// `loading` (true during any fetch) — use this to gate the initial-load UI.
const initialized = ref(false)

async function run(fn: () => Promise<void>) {
    loading.value = true
    try {
        await fn()
        error.value = false
    } catch (err) {
        console.error(err)
        error.value = true
    } finally {
        loading.value = false
        initialized.value = true
    }
}

async function loadMovies() {
    movies.value = await getMovies()
}

async function loadFilterOptions() {
    const [genres, decades, languages] = await Promise.all([
        getGenres(),
        getDecades(),
        getLanguages(),
    ])
    filterOptions.genres = genres
    filterOptions.decades = decades.map((d) => ({ value: d, label: `${d}s` }))
    filterOptions.languages = languages
}

// Full refresh: movies + filter options. Used on initial mount and when the
// filter options may have changed.
const refresh = () => run(() => Promise.all([loadMovies(), loadFilterOptions()]).then(() => {}))

// Movies only — filter options are left as-is. Used after add: a brand-new
// genre/decade/language won't appear in the filters until the next full refresh.
const refreshMovies = () => run(loadMovies)

function patchMovieInList(id: number, patch: Partial<MovieFull>) {
    const movie = movies.value.find((m) => m.id === id)
    if (movie) Object.assign(movie, patch)
}

function removeMovieFromList(id: number) {
    const index = movies.value.findIndex((m) => m.id === id)
    if (index !== -1) movies.value.splice(index, 1)
}

// Synchronous guard so the initial load fires exactly once, even if several
// components call useMovies() before the first fetch resolves.
let started = false

export function useMovies() {
    if (!started) {
        started = true
        refresh()
    }
    return {
        movies,
        filterOptions,
        refresh,
        refreshMovies,
        patchMovieInList,
        removeMovieFromList,
        error,
        loading,
        initialized,
    }
}
