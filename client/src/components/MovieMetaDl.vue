<script setup lang="ts">
import { computed } from 'vue'
import type { MovieFull, MovieKey } from '../types'
import MovieMetaDt from './MovieMetaDt.vue'

type MovieMetaTransform<K extends MovieKey> = {
    label: string | ((val: NonNullable<MovieFull[K]>) => string)
    description?: (val: NonNullable<MovieFull[K]>) => string
    class?: string
}

type MovieMetaKey =
    | 'addedBy'
    | 'runtime'
    | 'year'
    | 'directors'
    | 'language'
    | 'castMembers'
    | 'writers'
    | 'sourceAuthors'

const props = withDefaults(
    defineProps<{
        movie: MovieFull
        /**
         * Which meta items to display
         * @default `['year', 'language', 'runtime', 'directors']`
         */
        include?: MovieMetaKey[]
        stackedRows?: boolean
    }>(),
    {
        include: () => ['year', 'language', 'runtime', 'directors'],
    },
)

const movieMetaTransform: { [K in MovieMetaKey]: MovieMetaTransform<K> } = {
    addedBy: { label: 'Added By' },
    language: { label: 'Language' },
    runtime: { label: 'Runtime', description: (val) => `${val}m` },
    year: { label: 'Year' },
    directors: {
        label: (val) => (val.length > 1 ? 'Directors' : 'Director'),
        description: (val) => val.join(', '),
    },
    castMembers: {
        label: 'Cast',
        description: (val) => val.map(({ name }) => name).join(', '),
    },
    writers: {
        label: 'Writers',
        description: (val) => val.join(', '),
    },
    sourceAuthors: {
        label: (val) => (val.length > 1 ? 'Source Authors' : 'Source Author'),
        description: (val) => val.join(', '),
    },
}

function resolveMeta<K extends MovieMetaKey>(key: K, val: NonNullable<MovieFull[K]>) {
    const transform = movieMetaTransform[key]
    const label = typeof transform.label === 'string' ? transform.label : transform.label(val)
    const description = transform.description ? transform.description(val) : String(val)
    return { label, description, class: transform.class }
}

const metaItems = computed(() => {
    const items: { label: string; description: string; class?: string }[] = []

    props.include.forEach((key) => {
        let val = props.movie[key]
        if (val === null || val === undefined || (Array.isArray(val) && val.length === 0)) return
        items.push(resolveMeta(key, val))
    })

    return items
})
</script>

<template>
    <dl
        :class="stackedRows ? 'grid grid-cols-[auto_1fr]' : 'flex flex-wrap'"
        class="gap-x-6 gap-y-2">
        <MovieMetaDt
            v-for="(item, i) in metaItems"
            :key="i"
            :title="item.label"
            :description="item.description"
            :class="stackedRows ? 'col-span-2 grid grid-cols-subgrid items-baseline gap-4' : ''" />
    </dl>
</template>
