<script setup lang="ts">
import type { MovieDisplayOptions } from '../display-options'

const model = defineModel<MovieDisplayOptions>({ required: true })
</script>

<template>
    <fieldset class="displayopts">
        <legend class="displayopts__legend font-semibold">Show:</legend>
        <!-- <label v-for="(value, key) in model" :key="key" class="flex items-center gap-1">
            <input v-model="model[key]" type="checkbox" />
            {{ key }}
        </label> -->
        <label class="flex items-center gap-1">
            <input v-model="model.poster" type="checkbox" />
            Poster
        </label>
        <label class="flex items-center gap-1">
            <input v-model="model.tagline" type="checkbox" />
            Tagline
        </label>
        <label class="flex items-center gap-1">
            <input v-model="model.description" type="checkbox" />
            Description
        </label>
        <label class="flex items-center gap-1">
            <input v-model="model.genres" type="checkbox" />
            Genres
        </label>
        <label class="flex items-center gap-1">
            <input v-model="model.themes" type="checkbox" />
            Themes
        </label>
        <label class="flex items-center gap-1">
            <input v-model="model.tmdbScores" type="checkbox" />
            TMDB Scores
        </label>

        <label class="flex items-center gap-1">
            <input v-model="model.errors" type="checkbox" />
            Errors
        </label>
    </fieldset>
</template>
