<script setup lang="ts">
import { type MovieTypeFull } from '../../../server/src/movie-type.ts'
import PillItem from './PillItem.vue'

defineProps<{ movie: MovieTypeFull }>()
</script>

<template>
    <table>
        <tbody>
            <tr>
                <th>Name</th>
                <td>{{ movie.name }}</td>
            </tr>
            <tr>
                <th>Original Title</th>
                <td>{{ movie.originalTitle }}</td>
            </tr>
            <tr>
                <th>Year</th>
                <td>{{ movie.year }}</td>
            </tr>
            <tr v-if="movie.genres && movie.genres.length > 0">
                <th>Genres</th>
                <td>
                    <PillItem v-for="(genre, i) in movie.genres" :key="i" :content="genre" />
                </td>
            </tr>
            <tr>
                <th>TMDB ID</th>
                <td>{{ movie.tmdbId }}</td>
            </tr>
            <tr>
                <th>Tagline</th>
                <td>{{ movie.tagline }}</td>
            </tr>

            <tr>
                <th>Poster Path</th>
                <td>{{ movie.posterPath }}</td>
            </tr>

            <tr>
                <th>Language</th>
                <td>{{ movie.language }}</td>
            </tr>

            <tr>
                <th>Description</th>
                <td>{{ movie.description }}</td>
            </tr>
            <tr>
                <th>TMDB Reviews</th>
                <td>
                    <strong>Popularity: </strong>{{ movie.tmdbPopularity }}<br />
                    <strong>Vote Average: </strong>{{ movie.tmdbVoteAverage }} ({{
                        movie.tmdbVoteCount
                    }}
                    votes)
                </td>
            </tr>
            <tr>
                <th>Errors</th>
                <td>
                    <div v-if="movie.errors.length === 0">None</div>
                    <ul v-else>
                        <li v-for="(error, i) in movie.errors" :key="i">{{ error }}</li>
                    </ul>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped lang="scss">
table {
    border-collapse: collapse;
    margin-bottom: 50px;

    td,
    th {
        border: 1px solid var(--bluegray-400);
    }
}
</style>
