<script setup lang="ts">
withDefaults(
    defineProps<{
        tag?: string
    }>(),
    { tag: 'div' },
)
</script>

<template>
    <component
        :is="tag"
        class="border-brown-700 text-brown-200 inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm leading-tight font-medium">
        <slot />
    </component>
</template>
