<script setup lang="ts">
import FilterItems from './FilterItems.vue'
import { useMovies } from '../composables/useMovies'
import AppBtn from './AppBtn.vue'
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import AppTypography from './AppTypography.vue'
import PillItem from './PillItem.vue'
import type { MovieFilters } from '../types/index.ts'

const { moviesData } = useMovies()

defineProps<{
    shownCounts?: string
}>()

const filters = defineModel<MovieFilters>({ required: true })

const removeGenre = (genre: string) => {
    filters.value.genres = filters.value.genres.filter((g) => g !== genre)
}

const removeDecade = (decade: number) => {
    filters.value.decades = filters.value.decades.filter((d) => d !== decade)
}

const removeLanguage = (language: string) => {
    filters.value.languages = filters.value.languages.filter((d) => d !== language)
}

const hasActiveFilters = computed(() => {
    return (
        filters.value.genres.length > 0 ||
        filters.value.decades.length > 0 ||
        filters.value.languages.length > 0
    )
})

const clearAllFilters = () => {
    filters.value.genres = []
    filters.value.decades = []
    filters.value.languages = []
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
    <div class="card bg-brown-950/80 backdrop-blur-sm" role="region" aria-label="Filters">
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
            <AppTypography v-if="!hasActiveFilters" variant="caps" class="grow">
                No Active Filters
            </AppTypography>
            <div v-else class="flex grow justify-between gap-4">
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
                    <PillItem v-for="decade in filters.decades" :key="decade" tag="li" :alt="true">
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
                </ul>
                <AppTypography
                    variant="body-sm"
                    tag="button"
                    class="cursor-pointer underline decoration-dashed underline-offset-4 opacity-70 hover:decoration-brass hover:opacity-100 focus:decoration-brass focus:opacity-100"
                    @click="clearAllFilters">
                    Clear All
                </AppTypography>
            </div>
            <AppTypography v-if="shownCounts" variant="body-sm">{{ shownCounts }}</AppTypography>
        </div>
        <Transition
            name="filter-expand"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @leave="onLeave">
            <div v-show="isOpen" id="filter-bar-contents">
                <div class="flex gap-4 border-t border-subtle px-4 py-4">
                    <FilterItems
                        v-model="filters.genres"
                        :options="moviesData.genres"
                        label="Genres" />
                    <FilterItems
                        v-model="filters.decades"
                        :options="moviesData.decades"
                        label="Decades" />
                    <FilterItems
                        v-model="filters.languages"
                        :options="moviesData.languages"
                        label="Languages" />
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
