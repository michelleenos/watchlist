<script setup lang="ts">
import type { MovieTypeFull } from '../../../server/src/movie-type.ts'
import MoviePoster from './MoviePoster.vue'
import MovieTagline from './MovieTagline.vue'
import MovieTitle from './MovieTitle.vue'
import PillItem from './PillItem.vue'
import MovieMetaDl from './MovieMetaDl.vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{ movie: MovieTypeFull }>()
const { movie } = props
</script>

<template>
    <RouterLink
        :to="`movie/${movie.id}`"
        class="overflow-hidden rounded-lg border border-taupe-900 bg-taupe-900/50 p-4 transition-all hover:-translate-y-0.5 hover:bg-taupe-900">
        <article class="relative grid grid-cols-[auto_1fr] gap-5">
            <MoviePoster
                v-if="movie.posterPath"
                :src="movie.posterPath"
                :alt="`poster for ${movie.name}`" />
            <div class="grid grid-rows-[auto_auto_1fr_auto] gap-3">
                <header>
                    <MovieTitle :title="movie.name" :original-title="movie.originalTitle" />
                    <MovieTagline size="base" class="line-clamp-1">
                        {{ movie.tagline }}
                    </MovieTagline>
                </header>
                <MovieMetaDl :movie="movie" />
                <p v-if="movie.tmdbOverview" class="line-clamp-3 self-start text-sm text-taupe-300">
                    {{ movie.tmdbOverview }}
                </p>
                <ul v-if="movie.tmdbGenres" class="flex flex-wrap gap-x-2 gap-y-1">
                    <PillItem v-for="(genre, i) in movie.tmdbGenres" :key="i" tag="li">{{
                        genre
                    }}</PillItem>
                </ul>
            </div>
        </article>
    </RouterLink>
</template>

<style scoped lang="scss"></style>
