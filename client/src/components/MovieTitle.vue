<script setup lang="ts">
import { RouterLink } from 'vue-router'

withDefaults(
    defineProps<{
        title: string
        originalTitle?: string
        link?: string
        size?: 'base' | 'lg'
        tag?: string
    }>(),
    { size: 'base', tag: 'h3', originalTitle: undefined, link: undefined },
)
</script>

<template>
    <component
        :is="tag"
        class="flex flex-wrap items-baseline gap-x-4 font-serif leading-tight"
        :class="size === 'base' ? 'text-xl lg:text-2xl' : 'text-4xl font-semibold'">
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
    </component>
</template>
