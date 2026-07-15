<script setup lang="ts">
import type { MovieFull } from '../types'
import MoviePoster from './MoviePoster.vue'
import MovieTagline from './MovieTagline.vue'
import MovieTitle from './MovieTitle.vue'
import PillItem from './PillItem.vue'
import MovieMetaDl from './MovieMetaDl.vue'
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import AppTypography from './AppTypography.vue'
// import { useAuth } from '../composables/useAuth.ts'

// const { authState } = useAuth()

withDefaults(defineProps<{ movie: MovieFull; style?: 'default' | 'compact' }>(), {
    style: 'default',
})
</script>

<template>
    <RouterLink
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
                    <header>
                        <MovieTitle
                            class="mb-0.5"
                            size="sm"
                            :title="movie.name"
                            :original-title="movie.originalTitle" />
                    </header>
                    <p v-if="movie.language || movie.year" class="text-sm text-brown-300">
                        <span v-if="movie.language">{{ movie.language }}</span>
                        <span v-if="movie.language && movie.year"> · </span>
                        <span v-if="movie.year">{{ movie.year }}</span>
                    </p>
                </div>

                <ul
                    v-if="movie.genres"
                    class="wrap flex grow items-center justify-end gap-x-2 gap-y-1 max-md:hidden">
                    <PillItem v-for="(genre, i) in movie.genres" :key="i" tag="li">{{
                        genre
                    }}</PillItem>
                </ul>
            </div>
            <div v-else class="grid grid-rows-[auto_auto_1fr_auto] gap-3">
                <header class="">
                    <MovieTitle
                        class="mb-0.5"
                        :title="movie.name"
                        :original-title="movie.originalTitle" />
                    <MovieTagline size="base" class="line-clamp-1">
                        {{ movie.tagline }}
                    </MovieTagline>
                </header>
                <MovieMetaDl :movie="movie" class="border-b border-subtle pb-2" />
                <AppTypography
                    v-if="movie.description"
                    variant="body-muted-sm"
                    class="line-clamp-3 self-start">
                    {{ movie.description }}
                </AppTypography>
                <div class="grid grid-cols-[1fr_auto]">
                    <ul v-if="movie.genres" class="flex flex-wrap gap-x-2 gap-y-1">
                        <PillItem v-for="(genre, i) in movie.genres" :key="i" tag="li">{{
                            genre
                        }}</PillItem>
                    </ul>
                    <div
                        class="col-start-2 flex size-6 items-center justify-center self-end rounded-full"
                        :aria-label="movie.watched ? 'Watched' : 'Unwatched'"
                        :class="
                            movie.watched ? 'bg-brass/80 text-brown-800' : 'border border-brown-500'
                        ">
                        <Icon v-if="movie.watched" icon="ri:check-line" />
                    </div>
                    <!-- <div
                        v-if="movie.watched"
                        class="col-start-2 flex size-6 items-center justify-center self-end rounded-full bg-brass/40 text-brown-100"
                        aria-label="Watched"
                        title="Watched">
                        <Icon icon="ri:check-line" class="" />
                    </div> -->
                </div>
            </div>
        </article>
    </RouterLink>
</template>
