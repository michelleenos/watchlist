<script setup lang="ts">
import FilterItems from './FilterItems.vue'
import { useMovies } from '../composables/useMovies'
import AppBtn from './AppBtn.vue'
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import AppTypography from './AppTypography.vue'
import PillItem from './PillItem.vue'
import AppToggle from './AppToggle.vue'
import type { MovieView } from '../types/index.ts'
import { toReactive } from '@vueuse/core'

const { filterOptions } = useMovies()

defineProps<{
    counts?: { shown: number; total: number }
}>()

const view = defineModel<MovieView>({ required: true })
const { filters } = toReactive(view)

const removeGenre = (genre: string) => {
    filters.genres = filters.genres.filter((g) => g !== genre)
}

const removeDecade = (decade: number) => {
    filters.decades = filters.decades.filter((d) => d !== decade)
}

const removeLanguage = (language: string) => {
    filters.languages = filters.languages.filter((d) => d !== language)
}

const hasActiveFilters = computed(() => {
    return (
        filters.genres.length > 0 ||
        filters.decades.length > 0 ||
        filters.languages.length > 0 ||
        filters.watched !== null
    )
})

const clearAllFilters = () => {
    filters.genres = []
    filters.decades = []
    filters.languages = []
    filters.watched = null
}

const isOpen = ref(false)

// JS-driven height transition so the bar animates to/from its auto content height.
const onEnter = (el: Element) => {
    const node = el as HTMLElement
    node.style.height = '0'
    node.style.overflow = 'hidden'
    requestAnimationFrame(() => {
        node.style.height = `${node.scrollHeight}px`
    })
}

const onAfterEnter = (el: Element) => {
    const node = el as HTMLElement
    node.style.height = ''
    node.style.overflow = ''
}

const onLeave = (el: Element) => {
    const node = el as HTMLElement
    node.style.height = `${node.scrollHeight}px`
    node.style.overflow = 'hidden'
    requestAnimationFrame(() => {
        node.style.height = '0'
    })
}
</script>

<template>
    <div
        class="card bg-transparent bg-linear-to-r from-brown-darkest to-taupe-950/70 backdrop-blur-sm"
        role="region"
        aria-label="Filters">
        <div class="flex items-baseline gap-4 px-4 py-4">
            <AppBtn
                class="flex items-center gap-1"
                size="lg"
                aria-controls="filter-bar-contents"
                aria-label="Toggle Filters Menu"
                :aria-expanded="isOpen"
                @click="() => (isOpen = !isOpen)">
                <Icon icon="ri:filter-3-line" aria-hidden="true" />
                Filters
                <Icon
                    icon="ri:arrow-down-s-line"
                    aria-hidden="true"
                    class="transition-transform duration-200"
                    :class="{ 'rotate-180': isOpen }" />
            </AppBtn>
            <div class="grow *:max-sm:hidden">
                <AppTypography v-if="!hasActiveFilters" variant="caps-mono">
                    No Active Filters
                </AppTypography>
                <div v-else class="flex justify-between gap-4">
                    <ul class="flex gap-2" aria-label="Active Filters">
                        <PillItem v-for="genre in filters.genres" :key="genre" tag="li" :alt="true">
                            {{ genre }}
                            <button
                                :aria-label="`Remove ${genre} filter`"
                                class="-mb-0.5 ml-1 cursor-pointer text-brown-300 hover:text-amber-50 focus:text-amber-50"
                                @click="removeGenre(genre)">
                                <Icon icon="ri:close-line"></Icon>
                            </button>
                        </PillItem>
                        <PillItem
                            v-for="decade in filters.decades"
                            :key="decade"
                            tag="li"
                            :alt="true">
                            {{ decade }}
                            <button
                                :aria-label="`Remove ${decade} filter`"
                                class="-mb-0.5 ml-1 cursor-pointer text-brown-300 hover:text-amber-50 focus:text-amber-50"
                                @click="removeDecade(decade)">
                                <Icon icon="ri:close-line"></Icon>
                            </button>
                        </PillItem>
                        <PillItem
                            v-for="language in filters.languages"
                            :key="language"
                            tag="li"
                            :alt="true">
                            {{ language }}
                            <button
                                :aria-label="`Remove ${language} filter`"
                                class="-mb-0.5 ml-1 cursor-pointer text-brown-300 hover:text-amber-50 focus:text-amber-50"
                                @click="removeLanguage(language)">
                                <Icon icon="ri:close-line"></Icon>
                            </button>
                        </PillItem>
                        <PillItem v-if="filters.watched !== null" tag="li" :alt="true">
                            {{ filters.watched ? 'Watched' : 'Unwatched' }}
                            <button
                                aria-label="Remove watched filter"
                                class="-mb-0.5 ml-1 cursor-pointer text-brown-300 hover:text-amber-50 focus:text-amber-50"
                                @click="filters.watched = null">
                                <Icon icon="ri:close-line"></Icon>
                            </button>
                        </PillItem>
                    </ul>
                    <AppTypography
                        variant="body-sm"
                        tag="button"
                        class="cursor-pointer underline decoration-dashed underline-offset-4 opacity-70 hover:decoration-brass hover:opacity-100 focus:decoration-brass focus:opacity-100"
                        @click="clearAllFilters">
                        Clear All
                    </AppTypography>
                </div>
            </div>
            <div class="flex *:py-2">
                <p
                    v-if="counts"
                    class="relative shrink-0 border-r border-subtle pr-3 text-sm text-brown-500">
                    <span class="text-brown-100"> {{ counts.shown }}</span> / {{ counts.total }}
                </p>
                <AppToggle
                    v-model="view.compactView"
                    label="Compact"
                    class="shrink-0 pl-3 first:pl-0" />
            </div>
        </div>
        <Transition
            name="filter-expand"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @leave="onLeave">
            <div v-show="isOpen" id="filter-bar-contents">
                <div class="border-t border-subtle px-4 pt-2 pb-4">
                    <div class="pt-2">
                        <div class="flex flex-col gap-4 lg:flex-row">
                            <FilterItems
                                v-model="filters.watched"
                                :options="['Watched', 'Unwatched']"
                                label="Watched" />
                            <FilterItems
                                v-model="filters.decades"
                                :options="filterOptions.decades"
                                label="Decades" />
                            <FilterItems
                                v-model="filters.languages"
                                class=""
                                :options="filterOptions.languages"
                                label="Languages" />
                            <FilterItems
                                v-model="filters.genres"
                                :options="filterOptions.genres"
                                label="Genres" />
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
.filter-expand-enter-active,
.filter-expand-leave-active {
    transition:
        height 0.25s ease,
        opacity 0.2s ease;
}

.filter-expand-enter-from,
.filter-expand-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .filter-expand-enter-active,
    .filter-expand-leave-active {
        transition: none;
    }
}
</style>
