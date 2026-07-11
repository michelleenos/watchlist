<script setup lang="ts">
import { Icon } from '@iconify/vue'
withDefaults(defineProps<{ label?: string }>(), {
    label: 'Close',
})
</script>

<template>
    <button
        class="focus-outline size-6 cursor-pointer text-center text-inherit opacity-70 hover:opacity-100 focus:opacity-100"
        :aria-label="label">
        <Icon icon="ri:close-line" class="mx-auto size-5" />
    </button>
</template>

<style scoped lang="scss"></style>
