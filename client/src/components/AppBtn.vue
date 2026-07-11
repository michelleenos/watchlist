<script setup lang="ts">
import { computed } from 'vue'

type ButtonProps = {
    href?: string
    /**
     * open in new tab (only used if href is defined)
     */
    newTab?: boolean
    ariaLabel?: string
    destructive?: boolean
    size?: 'lg' | 'sm'
}

const props = withDefaults(defineProps<ButtonProps>(), {
    newTab: false,
    size: 'sm',
    ariaLabel: '',
    href: undefined,
    destructive: false,
})

const isLink = computed(() => !!props.href)
const external = computed(() => isLink.value && props.href?.startsWith('http'))
</script>

<template>
    <component
        v-bind="$attrs"
        :is="
            isLink ?
                !external && !newTab ?
                    'RouterLink'
                :   'a'
            :   'button'
        "
        :to="isLink && !external && !newTab ? href : null"
        :aria-label="ariaLabel"
        :target="newTab ? '_blank' : undefined"
        :href="isLink && external ? href : null"
        class="cursor-pointer rounded-full text-sm leading-none transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 active:brightness-90"
        :class="[
            destructive ?
                'border border-red-400 bg-none text-red-400 hover:bg-red-300/5 focus-visible:outline-amber-100'
            :   'bg-brass text-brown-950 focus-visible:outline-brass',
            size === 'sm' ? 'px-3 py-2 font-medium' : 'px-4 py-3 font-semibold',
        ]"
        :rel="newTab ? 'noopener noreferrer' : undefined">
        <slot></slot
    ></component>
</template>
