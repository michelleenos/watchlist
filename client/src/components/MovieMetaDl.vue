<script setup lang="ts">
import type { MovieTypeFull } from '../../../server/src/movie-type'
import MovieMetaDt from './MovieMetaDt.vue'

defineProps<{ movie: MovieTypeFull }>()
</script>

<template>
    <dl class="border-b-brown-800 flex gap-8 border-b pb-2">
        <MovieMetaDt v-if="movie.year" title="Year" :description="`${movie.year}`" />
        <MovieMetaDt
            v-if="movie.language"
            title="Language"
            :description="movie.language.toUpperCase()" />
    </dl>
</template>

<style scoped lang="scss"></style>
