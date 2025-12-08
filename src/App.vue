<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import moviesData from '../backend/data/movies.json'
import { type MovieTypeFull } from '../backend/src/movie-type'
import AddMovie from './components/AddMovie.vue'

import TagsFilter from './components/TagsFilter.vue'
import MovieCard from './components/MovieCard.vue'
import { defaultDisplayOptions, type MovieDisplayOptions } from './display-options'
import DisplayOptions from './components/DisplayOptions.vue'
// import MovieDebgCard from './components/MovieDebgCard.vue'

const typedMovies: MovieTypeFull[] = moviesData

const genresListSet = new Set<string>()
const themesListSet = new Set<string>()
typedMovies.forEach((movie) => {
    movie.genres?.forEach((genre) => {
        genresListSet.add(genre)
    })
    movie.themes?.forEach((theme) => {
        themesListSet.add(theme)
    })
})

const genresList = [...genresListSet].sort()
const themesList = [...themesListSet].sort()

const selectedGenres = ref<string[]>([])
const selectedThemes = ref<string[]>([])

const shownMovies = computed(() => {
    console.log('Recomputing shownMovies')
    const filtered = typedMovies.filter((movie) => {
        let selected = true
        if (selectedGenres.value.length > 0) {
            if (!movie.genres) selected = false
            if (!selectedGenres.value.some((genre) => movie.genres?.includes(genre))) {
                selected = false
            }
        }

        if (selectedThemes.value.length > 0) {
            if (!movie.themes) selected = false
            if (!selectedThemes.value.some((genre) => movie.themes?.includes(genre))) {
                selected = false
            }
        }
        // if (selectedGenres.value.length === 0) return true
        // return selectedGenres.value.some((genre) => movie.genres?.includes(genre))
        return selected
    })

    return filtered
})

const moviesDisplay = reactive<MovieDisplayOptions>({
    ...defaultDisplayOptions,
})
</script>

<template>
    <div
        class="grid h-screen grid-cols-[30%_1fr] xl:grid-cols-[25%_1fr] relative overflow-y-hidden">
        <div
            class="sidebar h-screen p-8 overflow-y-auto border-r border-bluegray-200 row-start-1 row-end-3">
            <DisplayOptions v-model="moviesDisplay" />

            <TagsFilter
                :selectedItems="selectedGenres"
                :items="genresList"
                label="Genre"
                @update="(value) => (selectedGenres = value)" />
            <TagsFilter
                :selectedItems="selectedThemes"
                :items="themesList"
                label="Themes"
                @update="(value) => (selectedThemes = value)" />
        </div>
        <div
            class="movies-topbar h-10 border-b border-bluegray-200 px-5 flex items-center justify-between">
            <div class="font-semibold">
                Showing {{ shownMovies.length }} movie{{ shownMovies.length !== 1 ? 's' : '' }}
            </div>
            <div>
                <AddMovie />
            </div>
        </div>
        <div class="movies-list overflow-y-auto">
            <MovieCard
                v-for="movie in shownMovies"
                :key="movie.name"
                :movie="movie"
                :displayOptions="moviesDisplay" />
        </div>
    </div>
</template>

<style scoped lang="scss">
// .displayopts {
//     &__item {
//         display: flex;
//         align-items: baseline;
//         gap: 5px;
//         font-size: 1rem;
//         line-height: 1.2;
//         margin-bottom: 5px;
//     }
// }
</style>
