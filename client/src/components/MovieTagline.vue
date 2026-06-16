<script setup lang="ts">
import AppTypography from './AppTypography.vue'

withDefaults(defineProps<{ size?: 'base' | 'lg'; tag?: string }>(), {
    size: 'base',
    tag: 'p',
})
</script>

<template>
    <AppTypography :tag="tag" :variant="size === 'base' ? 'tagline' : 'tagline-lg'">
        <slot></slot>
    </AppTypography>
</template>
