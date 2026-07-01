<script setup lang="ts">
import type { MovieFull } from '../types'
import MovieMetaDt from './MovieMetaDt.vue'

defineProps<{ movie: MovieFull }>()
</script>

<template>
    <dl class="flex gap-8 border-b border-b-brown-800 pb-2">
        <MovieMetaDt v-if="movie.year" title="Year" :description="`${movie.year}`" />
        <MovieMetaDt v-if="movie.language" title="Language" :description="movie.language" />
    </dl>
</template>

<style scoped lang="scss"></style>
