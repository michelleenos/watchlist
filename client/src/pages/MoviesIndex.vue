<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { type MovieTypeFull } from '../../../server/src/movie-type'
import { Icon } from '@iconify/vue'
import MovieCard from '../components/MovieCard.vue'
import FilterItems from '../components/FilterItems.vue'

const loading = ref(true)
const error = ref(false)
const genres = ref<string[]>([])
const languages = ref<string[]>([])
const decadeOpts = ref<{ value: number; label: string }[]>([])
const movies = ref<MovieTypeFull[]>([])

const filters = reactive<{ genres: string[]; decades: number[]; languages: string[] }>({
    genres: [],
    decades: [],
    languages: [],
})

const shownMovies = computed(() => {
    const { genres, decades, languages } = filters
    return [...movies.value].filter((movie) => {
        if (decades.length > 0) {
            if (!movie.year) return false
            const year = movie.year
            if (
                !decades.some((d) => {
                    if (year >= d && year < d + 10) return true
                    return false
                })
            ) {
                return false
            }
        }
        if (languages.length > 0) {
            if (!movie.language) return false
            if (!languages.some((lang) => movie.language === lang)) return false
        }
        if (genres.length > 0) {
            if (!movie.tmdbGenres) return false
            if (
                !movie.tmdbGenres.some((movieGenre) =>
                    filters.genres.includes(movieGenre.toLowerCase()),
                )
            )
                return false
        }
        return true
    })
})

async function fetchMovies() {
    try {
        const [moviesRes, genresRes, decadesRes, languagesRes] = await Promise.all([
            await fetch('/api/movies').then((res) => res.json()),
            await fetch('/api/genres').then((res) => res.json()),
            await fetch('/api/decades').then((res) => res.json()),
            await fetch('/api/languages').then((res) => res.json()),
        ])
        movies.value = moviesRes
        genres.value = genresRes
        decadeOpts.value = decadesRes.map((d: number) => ({ value: d, label: `${d}s` }))
        languages.value = languagesRes

        loading.value = false
        error.value = false
    } catch (err) {
        console.error(err)
        loading.value = false
        error.value = true
    }
}

onMounted(() => {
    fetchMovies()
})
</script>

<template>
    <div class="mx-auto max-w-11/12 2xl:max-w-352">
        <div class="flex items-center justify-between border-b border-b-taupe-700 pt-12 pb-8">
            <h1 class="text-2xl text-brass">watchlist</h1>
            <a href="#" class="btn btn--large">
                <Icon icon="ri:add-line" :inline="true" class="mr-2"></Icon>
                Add Movie
            </a>
        </div>
        <div v-if="loading">LOADING</div>
        <div v-else>
            <div class="my-4 flex gap-4">
                <FilterItems v-model="filters.genres" :options="genres" label="Genres" />
                <FilterItems v-model="filters.decades" :options="decadeOpts" label="Decades" />
                <FilterItems v-model="filters.languages" :options="languages" label="Languages" />
            </div>

            <div class="grid gap-6 py-8 lg:grid-cols-2">
                <div class="col-start-1 -col-end-1">
                    Showing <span class="font-semibold">{{ shownMovies.length }}</span> of
                    <span class="font-semibold">{{ movies.length }}</span>
                </div>

                <MovieCard v-for="movie in shownMovies" :key="movie.name" :movie="movie" />
            </div>
        </div>

        <RouterView />
    </div>
</template>
