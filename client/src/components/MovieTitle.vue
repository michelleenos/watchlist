<script setup lang="ts">
import AppTypography from './AppTypography.vue'

withDefaults(
    defineProps<{
        title: string
        originalTitle?: string | null
        size?: 'base' | 'lg' | 'sm'
        tag?: string
    }>(),
    { size: 'base', tag: 'h3', originalTitle: undefined },
)
</script>

<template>
    <AppTypography
        :tag="tag"
        :variant="
            size === 'lg' ? 'serif-lg'
            : size === 'sm' ? 'serif-sm'
            : 'serif-md'
        "
        class="flex flex-wrap items-baseline gap-x-4">
        {{ title }}
        <span
            v-if="originalTitle"
            class="text-brown-300"
            :class="
                size === 'lg' ? 'text-2xl'
                : size === 'sm' ? 'text-sm'
                : 'text-lg'
            ">
            ({{ originalTitle }})
        </span>
    </AppTypography>
</template>
