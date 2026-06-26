<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppTypography from './AppTypography.vue'

withDefaults(
    defineProps<{
        title: string
        originalTitle?: string | null
        link?: string
        size?: 'base' | 'lg'
        tag?: string
    }>(),
    { size: 'base', tag: 'h3', originalTitle: undefined, link: undefined },
)
</script>

<template>
    <AppTypography
        :tag="tag"
        :variant="size === 'base' ? 'serif-sm' : 'serif-lg'"
        class="flex flex-wrap items-baseline gap-x-4">
        <RouterLink v-if="link" :to="link">
            {{ title }}
            <span v-if="originalTitle" :class="size === 'base' ? 'text-lg' : 'text-2xl'">
                ({{ originalTitle }})
            </span>
        </RouterLink>
        <template v-else>
            {{ title }}
            <span v-if="originalTitle" :class="size === 'base' ? 'text-lg' : 'text-2xl'">
                ({{ originalTitle }})
            </span>
        </template>
    </AppTypography>
</template>
