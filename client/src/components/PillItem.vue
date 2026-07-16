<script setup lang="ts">
withDefaults(
    defineProps<{
        tag?: string
        interactive?: boolean
        active?: boolean
        alt?: boolean
        size?: 'default' | 'tiny'
    }>(),
    { tag: 'div', interactive: false, active: false, alt: false, size: 'default' },
)
</script>

<template>
    <component
        :is="tag"
        class="font-500 inline-flex items-center justify-center rounded-full border text-center text-nowrap text-brown-300 transition-[filter,background-color,border-color,color]"
        :class="[
            size === 'tiny' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm leading-tight',
            alt && 'border-transparent bg-brass/20 text-brown-100',
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
