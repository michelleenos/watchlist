<script setup lang="ts">
import { computed, reactive } from 'vue'

// import FilterItems from '../components/FilterItems.vue'
import AddMovie from '../components/AddMovie.vue'
import { useMovies } from '../composables/useMovies.ts'
import { useAuth } from '../composables/useAuth.ts'
import AuthFooter from '../components/AuthFooter.vue'
import FilterBar from '../components/FilterBar.vue'
import MoviesList from '../components/MoviesList.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import type { MovieView } from '../types/index.ts'
import { useModalOpen } from '../composables/useModalOpen.ts'

let viewOpts = reactive<MovieView>({
    filters: {
        genres: [],
        decades: [],
        languages: [],
        watched: null,
    },
    compactView: false,
})

const { movies, loading, initialized } = useMovies()
const { authState } = useAuth()
const { modalOpen } = useModalOpen()

const shownMovies = computed(() => {
    const { genres, decades, languages } = viewOpts.filters
    return [...movies.value].filter((movie) => {
        if (viewOpts.filters.watched !== null) {
            if (viewOpts.filters.watched === 'Watched' && !movie.watched) return false
            if (viewOpts.filters.watched === 'Unwatched' && movie.watched) return false
        }
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
            if (!movie.genres) return false
            if (!movie.genres.some((movieGenre) => viewOpts.filters.genres.includes(movieGenre)))
                return false
        }
        return true
    })
})
</script>

<template>
    <div class="mx-auto max-w-11/12 2xl:max-w-352" :inert="$route.matched.length > 1 || modalOpen">
        <div class="flex items-center justify-between border-b border-b-brown-700 pt-12 pb-8">
            <h1 class="text-2xl text-brass">watchlist</h1>
            <AddMovie v-if="authState.authenticated" />
        </div>
        <div
            v-if="!initialized"
            class="flex flex-col items-center justify-center gap-4 py-32 text-brown-500">
            <LoadingSpinner />
            <p class="text-sm tracking-wide">Loading watchlist…</p>
        </div>
        <div v-else>
            <div class="sticky top-2 z-99 my-4">
                <FilterBar
                    v-model="viewOpts"
                    :counts="{ shown: shownMovies.length, total: movies.length }" />
            </div>

            <div class="relative">
                <MoviesList
                    :movies="shownMovies"
                    :compact="viewOpts.compactView"
                    :class="loading && 'pointer-events-none opacity-40 transition-opacity'" />
                <div
                    v-if="loading"
                    class="pointer-events-none absolute inset-0 flex justify-center pt-16">
                    <LoadingSpinner />
                </div>
            </div>
        </div>
    </div>
    <AuthFooter />
    <RouterView />
</template>
