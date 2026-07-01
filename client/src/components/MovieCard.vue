<script setup lang="ts">
import type { MovieFull } from '../types'
import MoviePoster from './MoviePoster.vue'
import MovieTagline from './MovieTagline.vue'
import MovieTitle from './MovieTitle.vue'
import PillItem from './PillItem.vue'
import MovieMetaDl from './MovieMetaDl.vue'
import { RouterLink } from 'vue-router'
import AppTypography from './AppTypography.vue'

const props = defineProps<{ movie: MovieFull }>()
const { movie } = props
</script>

<template>
    <RouterLink
        :to="`/movie/${movie.id}`"
        class="block overflow-hidden rounded-lg border border-brown-900 bg-brown-950/50 p-4 outline-0 transition-all hover:-translate-y-0.5 hover:bg-brown-950 focus:-translate-y-0.5 focus:border-brass focus:bg-brown-950">
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
                <AppTypography
                    v-if="movie.description"
                    variant="body-muted-sm"
                    class="line-clamp-3 self-start">
                    {{ movie.description }}
                </AppTypography>
                <ul v-if="movie.genres" class="flex flex-wrap gap-x-2 gap-y-1">
                    <PillItem v-for="(genre, i) in movie.genres" :key="i" tag="li">{{
                        genre
                    }}</PillItem>
                </ul>
            </div>
        </article>
    </RouterLink>
</template>

<style scoped lang="scss"></style>
