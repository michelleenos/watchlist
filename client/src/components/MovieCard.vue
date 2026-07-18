<script setup lang="ts">
import type { MovieFilters, MovieFull } from '../types'
import MoviePoster from './MoviePoster.vue'
import MovieTagline from './MovieTagline.vue'
import MovieTitle from './MovieTitle.vue'
import PillItem from './PillItem.vue'
import MovieMetaDl from './MovieMetaDl.vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppTypography from './AppTypography.vue'

withDefaults(
    defineProps<{
        movie: MovieFull
        style?: 'default' | 'compact'
        genresFilters?: MovieFilters['genres']
    }>(),
    {
        genresFilters: () => [],
        style: 'default',
    },
)

const emit = defineEmits<{
    filterSelect: [genre: string]
}>()
</script>

<template>
    <div
        :to="`/movie/${movie.id}`"
        class="card block overflow-hidden p-4 outline-0 transition-all hover:-translate-y-0.5 hover:bg-brown-950/70 focus:-translate-y-0.5 focus:border-brass focus:bg-brown-950/70">
        <article
            class="relative grid gap-5"
            :class="style === 'default' ? 'grid-cols-[auto_1fr]' : ''">
            <MoviePoster
                v-if="style === 'default' && movie.posterPath"
                :src="movie.posterPath"
                :alt="`poster for ${movie.name}`" />

            <div v-if="style === 'compact'" class="flex items-center gap-6">
                <div class="w-1/2 max-w-100 flex-1/2 grow">
                    <RouterLink :to="`/movie/${movie.id}`" class="text-brown-100">
                        <header>
                            <MovieTitle
                                class="mb-0.5"
                                size="sm"
                                :title="movie.name"
                                :original-title="movie.originalTitle" />
                        </header>
                    </RouterLink>
                    <p v-if="movie.language || movie.year" class="text-sm text-brown-300">
                        <span v-if="movie.language">{{ movie.language }}</span>
                        <span v-if="movie.language && movie.year"> · </span>
                        <span v-if="movie.year">{{ movie.year }}</span>
                    </p>
                </div>

                <ul
                    v-if="movie.genres"
                    class="wrap flex grow items-center justify-end gap-x-2 gap-y-1 max-md:hidden">
                    <li v-for="(genre, i) in movie.genres" :key="i">
                        <PillItem
                            tag="button"
                            interactive
                            :alt="genresFilters.includes(genre)"
                            :aria-pressed="genresFilters.includes(genre)"
                            @click.stop="emit('filterSelect', genre)">
                            {{ genre }}
                        </PillItem>
                    </li>
                </ul>
            </div>
            <div v-else class="grid grid-rows-[auto_auto_1fr_auto]">
                <RouterLink :to="`/movie/${movie.id}`" class="text-brown-100">
                    <header class="">
                        <MovieTitle
                            class="mb-0.5"
                            :title="movie.name"
                            :original-title="movie.originalTitle" />
                        <MovieTagline size="base" class="mb-2 line-clamp-1">
                            {{ movie.tagline }}
                        </MovieTagline>
                        <div v-if="movie.directors" class="my-2 flex items-baseline gap-3">
                            <AppTypography variant="caps-mono">{{
                                movie.directors.length > 1 ? 'Directors' : 'Director'
                            }}</AppTypography>
                            <AppTypography variant="body-sm">{{
                                movie.directors.join(', ')
                            }}</AppTypography>
                        </div>
                    </header>
                </RouterLink>
                <MovieMetaDl :movie="movie" class="border-b border-subtle pb-2" />
                <AppTypography
                    v-if="movie.description"
                    variant="body-muted-sm"
                    class="my-2 line-clamp-3 self-start">
                    {{ movie.description }}
                </AppTypography>
                <div class="grid grid-cols-[1fr_auto]">
                    <ul v-if="movie.genres" class="flex flex-wrap gap-x-2 gap-y-1">
                        <li v-for="(genre, i) in movie.genres" :key="i">
                            <PillItem
                                tag="button"
                                interactive
                                :alt="genresFilters.includes(genre)"
                                :aria-pressed="genresFilters.includes(genre)"
                                @click.stop="emit('filterSelect', genre)">
                                {{ genre }}
                            </PillItem>
                        </li>
                    </ul>

                    <PillItem
                        v-if="movie.watched"
                        class="col-start-2 ml-2 flex items-center self-end"
                        alt
                        size="tiny">
                        <Icon icon="ri:check-line" class="mr-0.5 -ml-1" />
                        watched
                    </PillItem>
                </div>
            </div>
        </article>
    </div>
</template>
