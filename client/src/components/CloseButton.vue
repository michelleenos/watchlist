<script setup lang="ts">
import { Icon } from '@iconify/vue'
withDefaults(defineProps<{ label?: string }>(), {
    label: 'Close',
})
</script>

<template>
    <button
        class="size-6 opacity-70 hover:opacity-100 focus:opacity-100 cursor-pointer focus-outline text-center">
        <Icon icon="ri:close-line" class="size-5 mx-auto" />
    </button>
</template>

<style scoped lang="scss"></style>
