<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { type TMDBSearchReturn } from '../../../server/src/external/tmdb.ts'
import { type MovieTypeFull } from '../../../server/src/movie-type.ts'
import { Icon } from '@iconify/vue'
import AppBtn from './AppBtn.vue'
import AppTypography from './AppTypography.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import AppDialog from './AppDialog.vue'
import { useToast } from '../composables/useToast.ts'
import { useMovies } from '../composables/useMovies.ts'

const { moviesData, refresh } = useMovies()

const existingTmdbIds = computed(() => new Set(moviesData.movies.map((m) => m.tmdbId)))

const dialog = useTemplateRef('dialog')
const searchInput = ref('')
const searchName = ref('')
const searchResults = ref<TMDBSearchReturn[] | null>(null)
const searching = ref(false)
const searchError = ref(false)
const adding = ref<number | null>(null)

const toasts = useToast()

const open = () => dialog.value?.open()
const close = () => dialog.value?.close()

const onClose = () => clearResults()

const search = async () => {
    if (!searchInput.value.trim()) return
    searchName.value = searchInput.value
    searching.value = true
    searchError.value = false
    try {
        const res = await fetch(`/api/tmdb/search?name=${encodeURIComponent(searchName.value)}`)
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
        searchResults.value = await res.json()
    } catch (err) {
        console.error(err)
        searchError.value = true
    } finally {
        searching.value = false
    }
}

const addMovie = async (tmdbId: number) => {
    adding.value = tmdbId
    try {
        const res = await fetch(`/api/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tmdbId }),
        })
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
        const movie = (await res.json()) as MovieTypeFull
        refresh()
        toasts.add({ html: `added movie <strong>${movie.name}</strong>` })
        close()
    } catch (err) {
        console.error(err)
        toasts.add('error adding movie', 'error')
    } finally {
        adding.value = null
    }
}

const clearResults = () => {
    searchResults.value = null
    searchInput.value = ''
    searchName.value = ''
    searchError.value = false
}
</script>

<template>
    <AppBtn class="flex items-center gap-1" size="lg" @click="open">
        <Icon icon="ri:add-line" />
        Add Movie
    </AppBtn>

    <AppDialog ref="dialog" @close="onClose">
        <div class="flex max-h-[80vh] flex-col">
            <div class="shrink-0 px-8 pt-8 pb-6">
                <div class="mb-6 flex items-center justify-between">
                    <AppTypography variant="caps">Add Movie</AppTypography>
                </div>

                <!-- Search input -->
                <div class="relative flex items-center">
                    <input
                        v-model="searchInput"
                        type="text"
                        placeholder="Search for a movie..."
                        class="w-full min-w-0 rounded-lg border border-brown-700 bg-brown-900 py-3 pr-12 pl-4 text-sm text-brown-100 placeholder:text-brown-600 focus:border-brass focus:outline-none"
                        @keydown.enter="search" />
                    <button
                        :disabled="searching"
                        class="absolute right-2 cursor-pointer rounded-sm p-2 text-brown-500 transition-colors hover:text-brass focus:text-brass focus:not-focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brass disabled:opacity-40"
                        aria-label="Search"
                        @click="search">
                        <Icon icon="ri:search-line" class="size-4" />
                    </button>
                </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto px-8 pb-8">
                <!-- Searching -->
                <div v-if="searching" class="flex justify-center py-12">
                    <LoadingSpinner />
                </div>

                <!-- Search error -->
                <p v-if="searchError" class="text-sm text-brown-400">
                    Something went wrong. Try again.
                </p>

                <!-- Results -->
                <div v-if="searchResults" class="mt-2">
                    <div class="mb-3 flex items-baseline justify-between">
                        <AppTypography variant="body-muted-sm">
                            Results for "{{ searchName }}"
                        </AppTypography>
                        <button
                            class="cursor-pointer text-xs text-brown-500 transition-colors hover:text-brown-300"
                            @click="clearResults">
                            Clear
                        </button>
                    </div>

                    <p v-if="searchResults.length === 0" class="py-4 text-sm text-brown-400">
                        No results found.
                    </p>

                    <ul class="divide-y divide-brown-900">
                        <li v-for="movie in searchResults" :key="movie.id">
                            <button
                                type="button"
                                :disabled="existingTmdbIds.has(movie.id) || adding === movie.id"
                                class="group -mx-4 -my-px flex w-[calc(100%+2rem)] gap-4 rounded px-4 py-4 text-left transition-colors focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brass enabled:cursor-pointer enabled:hover:bg-brown-900 enabled:focus-visible:bg-brown-900 disabled:opacity-60"
                                @click="() => addMovie(movie.id)">
                                <div class="w-12 shrink-0">
                                    <img
                                        v-if="movie.posterPath"
                                        :src="`https://image.tmdb.org/t/p/w92/${movie.posterPath}`"
                                        :alt="`${movie.title} poster`"
                                        class="w-full rounded object-cover" />
                                    <div
                                        v-else
                                        class="flex aspect-2/3 w-full items-center justify-center rounded bg-brown-800">
                                        <span class="text-xs text-brown-600">?</span>
                                    </div>
                                </div>

                                <div class="min-w-0 flex-1">
                                    <div class="flex items-baseline gap-2">
                                        <span
                                            class="leading-tight font-semibold text-brown-100 transition-colors group-hover:enabled:text-brass">
                                            {{ movie.title }}
                                        </span>
                                        <span class="shrink-0 text-xs text-brown-500">
                                            {{ movie.releaseDate?.split('-')[0] }}
                                        </span>
                                    </div>
                                    <p class="mt-0.5 mb-1 text-xs text-brown-500">
                                        {{ movie.originalLanguage?.toUpperCase() }}
                                    </p>
                                    <p class="line-clamp-2 text-sm leading-snug text-brown-400">
                                        {{ movie.overview }}
                                    </p>
                                </div>

                                <div class="flex shrink-0 items-center">
                                    <span v-if="adding === movie.id" class="text-xs text-brown-500">
                                        Adding…
                                    </span>
                                    <span
                                        v-else-if="existingTmdbIds.has(movie.id)"
                                        class="text-xs text-brown-500">
                                        Already added
                                    </span>
                                    <span
                                        v-else
                                        class="text-xs text-brass opacity-0 transition-opacity group-hover:opacity-100">
                                        Add →
                                    </span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </AppDialog>
</template>

<style scoped lang="scss"></style>
