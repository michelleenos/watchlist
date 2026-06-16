<script setup lang="ts">
withDefaults(
    defineProps<{
        tag?: string
        selectable?: boolean
        active?: boolean
    }>(),
    { tag: 'div', selectable: false, active: false },
)
</script>

<template>
    <component
        :is="tag"
        class="inline-flex items-center justify-center rounded-full border border-brown-700 px-3 py-1 text-sm leading-tight font-medium text-brown-200"
        :class="[
            selectable &&
                'cursor-pointer peer-checked:border-brass peer-checked:bg-brass peer-checked:text-taupe-950 peer-focus-visible:outline-2 peer-focus-visible:outline-brass hover:bg-brass/15 peer-checked:hover:bg-brass',
            active && 'border-brass bg-brass text-taupe-950 hover:bg-brass',
        ]"
        v-bind="$attrs">
        <slot />
    </component>
</template>
