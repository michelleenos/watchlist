<script setup lang="ts">
import { computed } from 'vue'
import { type MovieTypeFull } from '../../../server/src/movie-type.ts'
import { defaultDisplayOptions, type MovieDisplayOptions } from '../display-options.ts'
import DropdownContent from './DropdownContent.vue'
import DropdownRow from './DropdownRow.vue'
import TagItem from './TagItem.vue'

const props = defineProps<{
    movie: MovieTypeFull
    displayOptions?: MovieDisplayOptions
}>()
const { movie } = props

const displayOptions = computed(() => ({ ...defaultDisplayOptions, ...props.displayOptions }))

const deleteMovie = () => {
    fetch(`/api/movie?id=${movie.id}`, {
        method: 'DELETE',
    })
        .then((response) => {
            console.log(response.status)
            console.log(response)
        })
        .catch((error) => {
            console.error(error)
        })
}
</script>

<template>
    <div
        class="movie my-5 py-2.5 px-5 max-w-[1000px] w-[90%] mx-auto border border-gray-300 bg-gray-50 grid grid-cols-[auto_1fr] rounded-sm shadow-sm text-gray-950">
        <div class="movie__col-side">
            <div
                v-if="displayOptions.poster"
                class="movie__poster my-1 aspect-[2/3] w-[120px] mr-4 rounded-sm overflow-hidden border border-gray-100">
                <img
                    v-if="movie.posterPath"
                    class="w-full h-full object-cover"
                    :src="`${movie.posterPath}`"
                    :alt="`Poster of ${movie.name}`" />
            </div>
        </div>
        <div class="movie__col-main">
            <div
                class="movie__header grid grid-cols-[1fr_auto] gap-x-2 items-start border-b border-gray-200 pb-1 mb-2">
                <div class="col-start-1 row-start-1 self-center">
                    <h2 class="m-0 font-bold text-xl leading-6 text-gray-800">
                        {{ movie.name }}
                    </h2>
                    <div
                        v-if="movie.originalTitle && movie.originalTitle !== movie.name"
                        class="color-gray-700">
                        ({{ movie.originalTitle }})
                    </div>
                </div>

                <div class="col-start-2 self-start justify-self-end relative">
                    <DropdownContent>
                        <DropdownRow @click="deleteMovie"> Delete Movie </DropdownRow>
                    </DropdownContent>
                    <!-- <AppBtn
                        variant="text"
                        color="red"
                        size="icon"
                        ariaLabel="delete"
                        @click="() => deleteMovie(movie.id)">
                        <Icon icon="mdi:delete" /> -->
                    <!-- </AppBtn> -->
                </div>

                <p
                    v-if="displayOptions.tagline && movie.tagline"
                    class="italic text-gray-600 mt-1 col-start-1 font-light leading-snug">
                    {{ movie.tagline }}
                </p>
                <div
                    class="self-baseline leading-none col-start-1 text-sm text-gray-600 grid gap-x-5 grid-cols-[12ch_12ch] mt-1">
                    <div v-if="movie.language" class="flex justify-between gap-2 mb-1">
                        <strong>language</strong>
                        {{ movie.language }}
                    </div>
                    <div v-if="movie.year" class="flex justify-between gap-2">
                        <strong>year</strong>
                        {{ movie.year }}
                    </div>
                </div>
            </div>

            <p
                v-if="displayOptions.description && movie.tmdbOverview"
                class="movie__description mb-2">
                {{ movie.tmdbOverview }}
            </p>

            <div v-if="displayOptions.tmdbScores" class="text-sm my-2">
                <div v-if="movie.tmdbPopularity">
                    <strong>TMDB Popularity Score: </strong>{{ movie.tmdbPopularity }}
                </div>
                <div v-if="movie.tmdbVoteAverage">
                    <strong>TMDB Vote Average: </strong>
                    {{ movie.tmdbVoteAverage }} ({{ movie.tmdbVoteCount }} votes)
                </div>
            </div>

            <ul v-if="displayOptions.genres && movie.genres" class="taglist my-1">
                <TagItem
                    v-for="(genre, j) in movie.genres"
                    :key="j"
                    tagName="li"
                    :content="genre"
                    :maxWidth="20" />
            </ul>

            <ul v-if="displayOptions.themes && movie.themes" class="taglist my-1">
                <TagItem
                    v-for="(theme, j) in movie.themes"
                    :key="j"
                    tagName="li"
                    :content="theme" />
            </ul>

            <div
                v-if="displayOptions.errors && movie.errors.length > 0"
                class="text-red-800 text-sm">
                <div v-for="(error, i) in movie.errors" :key="i" class="mb-2">
                    {{ error }}
                </div>
            </div>
        </div>
    </div>
</template>
