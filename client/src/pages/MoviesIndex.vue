<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import MovieCard from '../components/MovieCard.vue'
import FilterItems from '../components/FilterItems.vue'
import AddMovie from '../components/AddMovie.vue'
import { useMovies } from '../composables/useMovies.ts'

const filters = reactive<{ genres: string[]; decades: number[]; languages: string[] }>({
    genres: [],
    decades: [],
    languages: [],
})

const { moviesData, refresh, loading } = useMovies()

const shownMovies = computed(() => {
    const { genres, decades, languages } = filters
    return [...moviesData.movies].filter((movie) => {
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

onMounted(() => {
    refresh()
})
</script>

<template>
    <div class="mx-auto max-w-11/12 2xl:max-w-352">
        <div class="flex items-center justify-between border-b border-b-brown-700 pt-12 pb-8">
            <h1 class="text-2xl text-brass">watchlist</h1>
            <AddMovie />
        </div>
        <div v-if="loading">LOADING</div>
        <div v-else>
            <div class="my-4 flex gap-4">
                <FilterItems v-model="filters.genres" :options="moviesData.genres" label="Genres" />
                <FilterItems
                    v-model="filters.decades"
                    :options="moviesData.decades"
                    label="Decades" />
                <FilterItems
                    v-model="filters.languages"
                    :options="moviesData.languages"
                    label="Languages" />
            </div>

            <div class="grid gap-6 py-8 lg:grid-cols-2">
                <div class="col-start-1 -col-end-1">
                    Showing <span class="font-semibold">{{ shownMovies.length }}</span> of
                    <span class="font-semibold">{{ moviesData.movies.length }}</span>
                </div>

                <MovieCard v-for="movie in shownMovies" :key="movie.name" :movie="movie" />
            </div>
        </div>

        <RouterView />
    </div>
</template>
