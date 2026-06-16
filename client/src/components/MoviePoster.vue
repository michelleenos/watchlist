<script setup lang="ts">
withDefaults(
    defineProps<{
        src: string
        alt: string
        size?: 'sm' | 'lg'
    }>(),
    { size: 'sm' },
)
</script>

<template>
    <div
        class="relative aspect-2/3 w-36 overflow-hidden rounded-sm lg:w-40"
        :class="size === 'sm' ? 'w-36 lg:w-40' : 'w-40 lg:w-44'">
        <img class="h-full w-full object-cover" :src="src" :alt="alt" />
    </div>
</template>
