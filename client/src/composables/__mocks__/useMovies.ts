import { ref, reactive } from 'vue'
import type { MovieFull } from '../../types'
export function useMovies() {
    const moviesData = reactive<{
        movies: MovieFull[]
        genres: string[]
        decades: { value: number; label: string }[]
        languages: string[]
    }>({
        movies: [],
        genres: ['Action', 'Adventure', 'Science Fiction'],
        decades: [1950, 1960, 1970, 2000, 2010, 2020].map((d) => ({ value: d, label: `${d}s` })),
        languages: ['English', 'Spanish', 'Portuguese', 'Korean'],
    })
    const loading = ref(false)
    const error = ref(false)
    return {
        moviesData,
        refresh: () => {},
        error,
        loading,
    }
}
