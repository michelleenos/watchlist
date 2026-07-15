<script setup lang="ts">
import AppTypography from './AppTypography.vue'

defineProps<{
    title: string
    description: string
}>()
</script>

<template>
    <div>
        <AppTypography tag="dt" variant="caps-mono">{{ title }}</AppTypography>
        <dd class="text-sm">{{ description }}</dd>
    </div>
</template>
