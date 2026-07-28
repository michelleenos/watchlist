<script setup lang="ts">
import AppTypography from './AppTypography.vue'

defineProps<{
    title: string
    description: string
    horizontal?: boolean
}>()
</script>

<template>
    <div :class="horizontal ? 'flex items-baseline gap-2' : ''">
        <AppTypography tag="dt" variant="caps-mono">{{ title }}</AppTypography>
        <dd class="text-sm">{{ description }}</dd>
    </div>
</template>
