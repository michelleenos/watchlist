<script setup lang="ts">
withDefaults(
    defineProps<{
        tag?: string
        selectable?: boolean
        active?: boolean
        alt?: boolean
    }>(),
    { tag: 'div', selectable: false, active: false, alt: false },
)
</script>

<template>
    <component
        :is="tag"
        class="font-500 inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm leading-tight text-brown-300 transition-[filter,background-color,border-color,color]"
        :class="[
            alt && 'border-0 bg-brass/20 text-brown-100',
            selectable &&
                'cursor-pointer peer-checked:border-brass peer-checked:bg-brass peer-checked:text-brown-950 peer-focus-visible:outline-2 peer-focus-visible:outline-brass peer-checked:hover:bg-brass peer-checked:hover:brightness-110',
            selectable && !active && 'hover:bg-brass/15',
            active && 'border-brass bg-brass text-brown-950 hover:brightness-110',
            !active && 'border-brown-700',
        ]"
        v-bind="$attrs">
        <slot />
    </component>
</template>
