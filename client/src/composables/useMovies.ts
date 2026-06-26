import { reactive, ref } from 'vue'
import type { MovieTypeFull } from '../../../server/src/movie-type'

const moviesData = reactive<{
    movies: MovieTypeFull[]
    genres: string[]
    decades: { value: number; label: string }[]
    languages: string[]
}>({
    movies: [],
    genres: [],
    decades: [],
    languages: [],
})
const loading = ref(false)
const error = ref(false)

async function fetchMovies() {
    loading.value = true
    try {
        const [moviesRes, genresRes, decadesRes, languagesRes] = await Promise.all([
            fetch('/api/movies').then((res) => res.json()),
            fetch('/api/genres').then((res) => res.json()),
            fetch('/api/decades').then((res) => res.json()),
            fetch('/api/languages').then((res) => res.json()),
        ])

        moviesData.movies = moviesRes
        moviesData.genres = genresRes
        moviesData.decades = decadesRes.map((d: number) => ({ value: d, label: `${d}s` }))
        moviesData.languages = languagesRes

        error.value = false
    } catch (err) {
        console.error(err)
        error.value = true
    } finally {
        loading.value = false
    }
}

export function useMovies() {
    return { moviesData, refresh: fetchMovies, error, loading }
}
