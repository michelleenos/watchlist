<script setup lang="ts">
import type { MovieTypeFull } from '../../../../server/src/movie-type'
import MovieDefinitionItem from './MovieDefinitionItem.vue'

const props = defineProps<{ movie: MovieTypeFull }>()
const { movie } = props
</script>

<template>
    <article
        class="border-brown-900 bg-brown-950 relative grid grid-cols-[auto_1fr] gap-5 overflow-hidden rounded-lg border p-4">
        <div class="relative aspect-2/3 w-36 overflow-hidden rounded-sm lg:w-40">
            <img
                v-if="movie.posterPath"
                class="h-full w-full object-cover"
                :src="`${movie.posterPath}`"
                :alt="`poster for ${movie.name}`" />
        </div>
        <div class="grid grid-rows-[auto_auto_1fr_auto] gap-3">
            <header>
                <h3
                    class="flex flex-wrap items-baseline gap-x-4 font-serif text-xl leading-tight lg:text-2xl">
                    {{ movie.name }}
                    <span v-if="movie.originalTitle" class="text-lg">
                        ({{ movie.originalTitle }})
                    </span>
                </h3>
                <p
                    class="text-brass line-clamp-1 font-serif text-base leading-tight italic lg:text-lg">
                    {{ movie.tagline }}
                </p>
            </header>
            <dl class="border-b-brown-800 flex gap-8 border-b pb-2">
                <MovieDefinitionItem
                    v-if="movie.year"
                    title="Year"
                    :description="`${movie.year}`" />
                <MovieDefinitionItem
                    v-if="movie.language"
                    title="Language"
                    :description="movie.language.toUpperCase()" />
            </dl>
            <p v-if="movie.tmdbOverview" class="text-brown-300 line-clamp-3 self-start text-sm">
                {{ movie.tmdbOverview }}
            </p>
            <ul v-if="movie.tmdbGenres" class="flex flex-wrap gap-x-2 gap-y-1">
                <li v-for="(genre, i) in movie.tmdbGenres" :key="i" class="btn btn--outline">
                    {{ genre }}
                </li>
            </ul>
        </div>
    </article>
</template>

<style scoped lang="scss"></style>
