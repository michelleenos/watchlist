<script setup lang="ts">
import type { MovieFull } from '../types'
import MovieCard from './MovieCard.vue'

defineProps<{
    movies: MovieFull[]
}>()
</script>

<template>
    <div class="grid gap-6 py-8 lg:grid-cols-2">
        <!-- <div class="col-start-1 -col-end-1">
            Showing <span class="font-semibold">{{ shownMovies.length }}</span> of
            <span class="font-semibold">{{ movies.length }}</span>
        </div> -->

        <MovieCard v-for="movie in movies" :key="movie.name" :movie="movie" />
    </div>
</template>
