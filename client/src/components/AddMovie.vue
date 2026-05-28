<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import AppBtn from './AppBtn.vue'
import { type TMDBSearchReturn } from '../../../server/src/external/tmdb.ts'

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

const searchName = ref('')

const onDialogClick = (e: MouseEvent) => {
    if (!dialog.value) return
    if (e.target === dialog.value) {
        dialog.value.close()
    }
}

const searchResults = ref<TMDBSearchReturn[] | null>(null)

const search = async () => {
    fetch(`/api/search-tmdb?name=${encodeURIComponent(searchName.value)}`)
        .then((res) => {
            if (!res.ok || res.status !== 200) {
                throw new Error(`Error searching TMDB: ${res.status}: ${res.statusText}`)
            }
            return res.json()
        })
        .then((json: TMDBSearchReturn[]) => {
            searchResults.value = json
        })
        .catch((err) => {
            console.error(err)
        })
}

const addMovie = (tmdbId: number) => {
    fetch(`/api/movie`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tmdbId }),
    })
        .then((res) => {
            if (!res.ok || res.status !== 200) {
                throw new Error(`Error adding movie: ${res.status}: ${res.statusText}`)
            }
            return res.json()
        })
        .then((json) => {
            console.log(json)
            clearResults()
            searchName.value = ''
            dialog.value?.close()
        })
        .catch((err) => {
            console.error(err)
        })
}

const clearResults = () => {
    searchResults.value = null
    searchName.value = ''
}
</script>

<template>
    <AppBtn @click="() => dialog && dialog.showModal()">Add New Movie</AppBtn>
    <dialog
        ref="dialog"
        class="w-11/12 max-h-[80vh] max-w-[900px] bg-gray-50 backdrop:bg-gray-200/50 backdrop:backdrop-blur-md mx-auto my-[10vh]"
        @click="onDialogClick">
        <div class="px-8 pt-10 pb-14">
            <h1 class="border-b-gray-400 border-b-1 pb-3 mb-4 text-3xl">Add Movie</h1>

            <div v-if="searchResults" class="">
                <div class="flex justify-between mb-2">
                    <h2 class="text-lg">
                        You searched for <strong>{{ searchName }}</strong
                        >. Click on a result below to add to the list!
                    </h2>
                    <AppBtn variant="text" @click="clearResults">Clear results</AppBtn>
                </div>
                <div class="border-t-1 border-t-slate-300">
                    <div
                        v-for="(movie, i) in searchResults"
                        :key="i"
                        class="relative py-3 cursor-pointer border-y-2 border-slate-300 border-t-transparent hover:bg-cyan-50 hover:border-b-cyan-600 hover:border-t-cyan-600 group"
                        @click="() => addMovie(movie.id)">
                        <div
                            class="grid grid-cols-[70px_1fr] gap-x-4 max-h-[120px] overflow-hidden">
                            <img
                                class="w-70px h-120px object-cover"
                                :src="`https://image.tmdb.org/t/p/w500/${movie.posterPath}`"
                                :alt="`${movie.title} poster`" />
                            <div>
                                <h3 class="text-xl font-bold group-hover:text-cyan-800">
                                    {{ movie.title }}
                                </h3>
                                <div class="text-sm flex gap-x-3">
                                    <p><strong>Language</strong>: {{ movie.originalLanguage }}</p>
                                    <p>
                                        <strong>Year</strong>: {{ movie.releaseDate.split('-')[0] }}
                                    </p>
                                </div>
                                <p class="text-sm line-clamp-3">{{ movie.overview }}</p>
                            </div>
                        </div>
                        <div
                            class="absolute bottom-0 left-0 w-full h-3/4 hidden group-hover:block bg-gradient-to-t from-white from-10% to-transparent">
                            <div
                                class="absolute bottom-2 left-1/2 -translate-x-1/2 text-cyan-600 font-bold hover:text-indigo-600">
                                Add this movie
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="grid grid-cols-[1fr_auto] gap-x-1">
                <label for="search" class="col-start-1 col-end-3 font-medium">
                    What movie are you looking for?
                </label>
                <input
                    id="search"
                    v-model="searchName"
                    name="search"
                    class="border-1 border-gray-500 rounded-sm w-full px-2 focus:outline-2 focus:outline-cyan-500"
                    @keydown.enter="search" />

                <AppBtn class="self-stretch" @click="search">Search</AppBtn>
            </div>
        </div>
    </dialog>
</template>

<style scoped lang="scss"></style>
