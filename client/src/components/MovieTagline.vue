<script setup lang="ts">
withDefaults(defineProps<{ size?: 'base' | 'lg'; tag?: string }>(), {
    size: 'base',
    tag: 'p',
})
</script>

<template>
    <component
        :is="tag"
        class="text-brass font-serif leading-tight italic"
        :class="size === 'base' ? 'text-base' : 'text-lg lg:text-xl'">
        <slot />
    </component>
</template>
