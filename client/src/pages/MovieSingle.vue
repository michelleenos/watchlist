<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import type { MovieFull } from '../types'
import MoviePoster from '../components/MoviePoster.vue'
import MovieTagline from '../components/MovieTagline.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import MovieTitle from '../components/MovieTitle.vue'
import MovieMetaDl from '../components/MovieMetaDl.vue'
import PillItem from '../components/PillItem.vue'
import AppTypography from '../components/AppTypography.vue'
// import AppDialog from '../components/AppDialog.vue'
import AppBtn from '../components/AppBtn.vue'
import AppToggle from '../components/AppToggle.vue'
import { useToast } from '../composables/useToast.ts'
import { useMovies } from '../composables/useMovies.ts'
import { useAuth } from '../composables/useAuth.ts'
import { getMovie, patchMovie, deleteMovie as deleteMovieApi, ApiError } from '../api.ts'
import PageSidePanel from '../components/PageSidePanel.vue'

const route = useRoute()
const router = useRouter()
const movie = ref<MovieFull>()
const loading = ref(true)
const error = ref<boolean | ApiError>(false)
const dialog = useTemplateRef('dialog')
const confirmingDelete = ref(false)
const deleting = ref(false)
const toasts = useToast()
const { patchMovieInList, removeMovieFromList } = useMovies()
const { authState } = useAuth()

async function fetchMovie(id: string) {
    try {
        movie.value = await getMovie(id)
        loading.value = false
        error.value = false
    } catch (err) {
        console.error(err)
        if (err instanceof ApiError) {
            error.value = err
        } else {
            error.value = true
        }
        loading.value = false
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

const watched = computed({
    get: () => movie.value?.watched ?? false,
    set: (value) => setWatched(value),
})

function onWatchedRowClick(e: MouseEvent) {
    if (!authState.authenticated) return
    // Clicks on the AppToggle label toggle the checkbox natively; only handle
    // clicks landing elsewhere in the row so they don't double-toggle.
    if ((e.target as HTMLElement).closest('label')) return
    watched.value = !watched.value
}

async function setWatched(value: boolean) {
    if (!movie.value) return
    const prev = movie.value.watched
    const id = movie.value.id
    movie.value.watched = value
    try {
        await patchMovie(id, { watched: value })
        patchMovieInList(id, { watched: value })
    } catch (err) {
        console.error(err)
        if (movie.value) movie.value.watched = prev
        toasts.add('error updating watched status', 'error')
    }
}

async function deleteMovie() {
    if (!movie.value) return
    deleting.value = true
    const movieName = movie.value.name
    const id = movie.value.id
    try {
        await deleteMovieApi(id)
        toasts.add({ html: `deleted movie <strong>${movieName}</strong>` })
        removeMovieFromList(id)
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
    <PageSidePanel @request-close="$router.push('/')">
        <div class="px-8 py-12">
            <div v-if="loading" class="flex h-full w-full items-center justify-center">
                <LoadingSpinner />
            </div>
            <div v-else-if="error || !movie" class="flex min-h-1/2 w-full flex-col gap-4 py-4">
                <AppTypography tag="h1" variant="serif-lg" class="text-brass"
                    >Error finding movie</AppTypography
                >
                <p>
                    {{
                        error instanceof ApiError ? error.message : 'Sorry, something went wrong :('
                    }}
                </p>
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
                    <div
                        class="flex items-center justify-between gap-4 rounded-lg border border-brass/50 px-4 py-3"
                        :class="authState.authenticated && 'cursor-pointer select-none'"
                        @click="onWatchedRowClick">
                        <div class="flex items-center gap-3">
                            <div
                                aria-hidden="true"
                                class="flex size-6 items-center justify-center rounded-full transition-colors"
                                :class="
                                    movie.watched ? 'bg-brass text-brown-950' : (
                                        'bg-brown-800 text-brown-600'
                                    )
                                ">
                                <Icon icon="ri:check-line" />
                            </div>
                            <span class="text-brown-100">{{
                                movie.watched ? 'Watched' : 'Not Watched Yet'
                            }}</span>
                        </div>
                        <AppToggle
                            v-if="authState.authenticated"
                            v-model="watched"
                            label="Watched"
                            hide-label />
                    </div>
                    <div>
                        <MovieMetaDl
                            :movie="movie"
                            :include="['year', 'language', 'runtime']"
                            class="border-b border-subtle py-3 first:border-t" />
                        <MovieMetaDl
                            :movie="movie"
                            :include="['directors', 'castMembers', 'writers', 'sourceAuthors']"
                            class="border-b border-subtle py-3 first:border-t"
                            stackedRows />
                    </div>

                    <AppTypography v-if="movie.description" variant="body">
                        {{ movie.description }}
                    </AppTypography>
                    <ul v-if="movie.genres" class="flex flex-wrap gap-x-2 gap-y-1">
                        <PillItem v-for="(genre, i) in movie.genres" :key="i" tag="li">
                            {{ genre }}
                        </PillItem>
                    </ul>

                    <div
                        class="flex w-full items-baseline justify-between gap-3 border-t border-subtle pt-4">
                        <p v-if="movie.addedBy" class="text-sm text-brown-400">
                            Added by {{ movie.addedBy }}
                            <span v-if="movie.createdAt"
                                >on {{ new Date(movie.createdAt).toLocaleDateString() }}</span
                            >
                        </p>
                        <div
                            v-if="authState.authenticated"
                            class="flex items-center justify-end gap-3">
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
        </div>
    </PageSidePanel>
</template>
