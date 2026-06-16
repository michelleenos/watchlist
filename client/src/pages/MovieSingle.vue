<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { MovieTypeFull } from '../../../server/src/movie-type'
import CloseButton from '../components/CloseButton.vue'
import MoviePoster from '../components/MoviePoster.vue'
import MovieTagline from '../components/MovieTagline.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import MovieTitle from '../components/MovieTitle.vue'
import MovieMetaDl from '../components/MovieMetaDl.vue'
import PillItem from '../components/PillItem.vue'
import AppTypography from '../components/AppTypography.vue'

const route = useRoute()
const movie = ref<MovieTypeFull>()
const loading = ref(true)
const error = ref(false)
const dialog = useTemplateRef('dialog')

onMounted(() => dialog.value?.showModal())

async function fetchMovie(id: string) {
    try {
        const movieRes = await fetch(`/api/movies/${id}`).then((res) => res.json())
        movie.value = movieRes
        loading.value = false
        error.value = false
    } catch (err) {
        console.error(err)
        loading.value = false
        error.value = true
    }
}

onMounted(() => {
    fetchMovie(route.params.id as string)
})

watch(
    () => route.params.id,
    async (newId) => fetchMovie(newId as string),
)
</script>

<template>
    <dialog
        ref="dialog"
        class="text-amber-50 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        @click="
            (e) => {
                if (e.target === dialog) $router.back()
            }
        "
        @cancel="$router.back()">
        <!-- <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="$router.back()" /> -->
        <div
            class="fixed top-0 right-0 bottom-0 w-full max-w-150 bg-brown-950 bg-linear-to-br from-taupe-800 to-brown-950 to-60% px-8 py-12 md:w-8/12 md:border-l md:border-l-brown-700 lg:w-6/12">
            <CloseButton class="fixed top-8 right-4" @click="() => $router.back()" />

            <div v-if="loading" class="flex h-full w-full items-center justify-center">
                <LoadingSpinner />
            </div>
            <div
                v-else-if="error || !movie"
                class="flex min-h-1/2 w-full items-center justify-center">
                <p>Sorry, there seems to have been an error :(</p>
            </div>
            <div v-else>
                <MoviePoster
                    v-if="movie.posterPath"
                    class="mx-auto mb-8"
                    size="lg"
                    :src="movie.posterPath"
                    :alt="`poster for ${movie.name}`" />

                <div class="flex flex-col gap-6">
                    <header>
                        <MovieTitle
                            tag="h2"
                            size="lg"
                            :title="movie.name"
                            :original-title="movie.originalTitle" />
                        <MovieTagline size="lg" class="mt-2">{{ movie.tagline }}</MovieTagline>
                    </header>
                    <MovieMetaDl :movie="movie" />
                    <AppTypography v-if="movie.tmdbOverview" variant="body-muted">
                        {{ movie.tmdbOverview }}
                    </AppTypography>
                    <ul v-if="movie.tmdbGenres" class="flex flex-wrap gap-x-2 gap-y-1">
                        <PillItem v-for="(genre, i) in movie.tmdbGenres" :key="i" tag="li">
                            {{ genre }}
                        </PillItem>
                    </ul>
                </div>
            </div>
        </div>
    </dialog>
</template>
