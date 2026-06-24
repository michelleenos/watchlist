<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MovieTypeFull } from '../../../server/src/movie-type'
import MoviePoster from '../components/MoviePoster.vue'
import MovieTagline from '../components/MovieTagline.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import MovieTitle from '../components/MovieTitle.vue'
import MovieMetaDl from '../components/MovieMetaDl.vue'
import PillItem from '../components/PillItem.vue'
import AppTypography from '../components/AppTypography.vue'
import AppDialog from '../components/AppDialog.vue'
import AppBtn from '../components/AppBtn.vue'
import { useToast } from '../composables/useToast.ts'
import { useMovies } from '../composables/useMovies.ts'

const route = useRoute()
const router = useRouter()
const movie = ref<MovieTypeFull>()
const loading = ref(true)
const error = ref(false)
const dialog = useTemplateRef('dialog')
const confirmingDelete = ref(false)
const deleting = ref(false)
const toasts = useToast()
const { refresh } = useMovies()

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
    dialog.value?.open()
    fetchMovie(route.params.id as string)
})

watch(
    () => route.params.id,
    async (newId) => fetchMovie(newId as string),
)

async function deleteMovie() {
    if (!movie.value) return
    deleting.value = true
    const movieName = movie.value.name
    try {
        const res = await fetch(`/api/movies/${movie.value.id}`, { method: 'DELETE' })
        if (!res.ok) {
            console.error(`error deleting movie: ${res.status}: ${res.statusText}`)
            throw new Error(`${res.status}: ${res.statusText}`)
        }
        toasts.add({ html: `deleted movie <strong>${movieName}</strong>` })
        refresh()
        router.back()
    } catch (err) {
        console.error(err)
        toasts.add('error deleting movie', 'error')
    }
    deleting.value = false
    confirmingDelete.value = false
}
</script>

<template>
    <AppDialog ref="dialog" pageSide @close="$router.back()">
        <div class="px-8 py-12">
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
                    <AppTypography v-if="movie.description" variant="body">
                        {{ movie.description }}
                    </AppTypography>
                    <ul v-if="movie.genres" class="flex flex-wrap gap-x-2 gap-y-1">
                        <PillItem v-for="(genre, i) in movie.genres" :key="i" tag="li">
                            {{ genre }}
                        </PillItem>
                    </ul>

                    <div
                        class="flex w-full items-center justify-end gap-3 border-t border-brown-800 pt-4">
                        <template v-if="confirmingDelete">
                            <span class="text-sm font-bold">Really remove?</span>
                            <button
                                class="cursor-pointer text-sm text-brown-400 transition-colors hover:text-brown-200"
                                @click="confirmingDelete = false">
                                Cancel
                            </button>
                            <AppBtn :disabled="deleting" destructive @click="deleteMovie">
                                {{ deleting ? 'Removing…' : 'Remove' }}
                            </AppBtn>
                        </template>
                        <AppBtn v-else destructive @click="confirmingDelete = true">
                            Remove From List
                        </AppBtn>
                    </div>
                </div>
            </div>
        </div>
    </AppDialog>
</template>
