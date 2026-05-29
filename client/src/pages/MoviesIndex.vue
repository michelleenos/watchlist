<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { type MovieTypeFull } from '../../../server/src/movie-type'
import { Icon } from '@iconify/vue'
import MovieCard from '../components/MovieCard/MovieCard.vue'
import FilterItems from '../components/FilterItems.vue'

const loading = ref(true)
const error = ref(false)
const genres = ref<string[]>([])
const movies = ref<MovieTypeFull[]>([])

const filters = reactive<{ genres: string[] }>({
    genres: [],
})

const shownMovies = computed(() => {
    return [...movies.value].filter((movie) => {
        if (movie.language === 'en') return false
        if (filters.genres.length > 0) {
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
        const [moviesRes, genresRes] = await Promise.all([
            await fetch('/api/movies').then((res) => res.json()),
            await fetch('/api/genres').then((res) => res.json()),
        ])
        movies.value = moviesRes
        genres.value = genresRes

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
        <div class="border-b-brown-800 flex items-center justify-between border-b pt-12 pb-8">
            <h1 class="text-brass text-2xl">watchlist</h1>
            <a href="#" class="btn btn--large">
                <Icon icon="ri:add-line" :inline="true" class="mr-2"></Icon>
                Add Movie
            </a>
        </div>
        <div v-if="loading">LOADING</div>
        <div v-else>
            <div>
                <FilterItems v-model="filters.genres" :options="genres" label="Genres" />
            </div>

            <div class="grid gap-6 py-8 lg:grid-cols-2">
                <div class="col-start-1 -col-end-1">
                    Showing <span class="font-semibold">{{ shownMovies.length }}</span> of
                    <span class="font-semibold">{{ movies.length }}</span>
                </div>

                <MovieCard v-for="movie in shownMovies" :key="movie.name" :movie="movie" />
            </div>
        </div>
    </div>
</template>
