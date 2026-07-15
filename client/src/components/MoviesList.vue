<script setup lang="ts">
import type { MovieFull } from '../types'
import MovieCard from './MovieCard.vue'

withDefaults(
    defineProps<{
        movies: MovieFull[]
        compact?: boolean
    }>(),
    { compact: false },
)
</script>

<template>
    <div
        class="grid py-8"
        :class="compact ? 'grid-cols-1 gap-4 xl:grid-cols-2' : 'gap-6 lg:grid-cols-2'">
        <MovieCard
            v-for="movie in movies"
            :key="movie.name"
            :movie="movie"
            :style="compact ? 'compact' : 'default'" />
    </div>
</template>
