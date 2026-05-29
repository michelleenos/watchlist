<script setup lang="ts">
// import { computed, reactive, ref } from 'vue'
// import moviesData from '../../server/data/movies.json'
// import { type MovieTypeFull } from '../../server/src/movie-type.ts'

// import TagsFilter from './components/TagsFilter.vue'
// import { defaultDisplayOptions, type MovieDisplayOptions } from './display-options.ts'

// const typedMovies: MovieTypeFull[] = moviesData

// const genresListSet = new Set<string>()
// typedMovies.forEach((movie) => {
//     movie.genres?.forEach((genre) => {
//         genresListSet.add(genre)
//     })
// })

// const genresList = [...genresListSet].sort()

// const selectedGenres = ref<string[]>([])

// const shownMovies = computed(() => {
//     const filtered = typedMovies.filter((movie) => {
//         let selected = true
//         if (selectedGenres.value.length > 0) {
//             if (!movie.genres) selected = false
//             if (!selectedGenres.value.some((genre) => movie.genres?.includes(genre))) {
//                 selected = false
//             }
//         }

//         // if (selectedGenres.value.length === 0) return true
//         // return selectedGenres.value.some((genre) => movie.genres?.includes(genre))
//         return selected
//     })

//     return filtered
// })

// const moviesDisplay = reactive<MovieDisplayOptions>({
//     ...defaultDisplayOptions,
// })
</script>

<template>
    <div class="bg-brown-darkest relative min-h-screen overflow-y-hidden text-amber-50">
        <RouterView />
        <!-- <div class="px-4 py-4">
            <h1 class="serif text-brass text-lg font-semibold">watchlist</h1>
            <DisplayOptions v-model="moviesDisplay" />


        </div> -->
        <!-- <div class="flex h-10 items-center justify-between border-b px-5">
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
        </div> -->
    </div>
</template>
