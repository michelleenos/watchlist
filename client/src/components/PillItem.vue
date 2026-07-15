<script setup lang="ts">
withDefaults(
    defineProps<{
        tag?: string
        interactive?: boolean
        active?: boolean
        alt?: boolean
    }>(),
    { tag: 'div', interactive: false, active: false, alt: false },
)
</script>

<template>
    <component
        :is="tag"
        class="font-500 inline-flex items-center justify-center rounded-full border px-3 py-1 text-center text-sm leading-tight text-nowrap text-brown-300 transition-[filter,background-color,border-color,color]"
        :class="[
            alt && 'border-0 bg-brass/20 text-brown-100',
            interactive && 'cursor-pointer focus-visible:outline-2 focus-visible:outline-brass',
            interactive && !active && 'hover:bg-brass/15',
            active ?
                'border-brass bg-brass text-brown-950 hover:brightness-110'
            :   'border-brown-700',
        ]"
        v-bind="$attrs">
        <slot />
    </component>
</template>
