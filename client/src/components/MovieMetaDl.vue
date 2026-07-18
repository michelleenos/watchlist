<script setup lang="ts">
import type { MovieFull } from '../types'
import MovieMetaDt from './MovieMetaDt.vue'

defineProps<{ movie: MovieFull; horizontal?: boolean }>()
</script>

<template>
    <dl class="flex gap-6">
        <MovieMetaDt
            v-if="movie.year"
            :class="horizontal ? 'flex items-baseline gap-2' : ''"
            title="Year"
            :description="`${movie.year}`" />
        <MovieMetaDt
            v-if="movie.language"
            :class="horizontal ? 'flex items-baseline gap-2' : ''"
            title="Language"
            :description="movie.language" />
        <MovieMetaDt
            v-if="movie.addedBy"
            :class="horizontal ? 'flex items-baseline gap-2' : ''"
            title="Added By"
            :description="movie.addedBy" />
    </dl>
</template>

<style scoped lang="scss"></style>
