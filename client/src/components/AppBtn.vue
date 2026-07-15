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
        class="inline-flex cursor-pointer items-center rounded-full text-[0.75rem] leading-none transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 active:brightness-90 md:text-sm"
        :class="[
            destructive ?
                'border border-red-400 bg-none text-red-400 hover:bg-red-300/5 focus-visible:outline-amber-100'
            :   'bg-brass text-brown-950 focus-visible:outline-brass',
            size === 'sm' ?
                'px-2 py-2 font-medium md:px-3'
            :   'px-3 py-2.5 font-semibold md:px-4 md:py-3',
        ]"
        :rel="newTab ? 'noopener noreferrer' : undefined">
        <slot></slot
    ></component>
</template>
