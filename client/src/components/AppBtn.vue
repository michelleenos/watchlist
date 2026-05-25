<script setup lang="ts">
import { computed, ref } from 'vue'

type ButtonProps = {
    href?: string
    /**
     * open in new tab (only used if href is defined)
     */
    newTab?: boolean
    variant?: 'text' | 'solid' | 'outline' | 'soft'
    size?: 'sm' | 'lg' | 'icon'
    color?: 'red' | 'black' | 'default'
    ariaLabel?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
    newTab: false,
    variant: 'solid',
    size: 'sm',
    ariaLabel: '',
    href: undefined,
    color: 'default',
})

const isLink = computed(() => !!props.href)
const external = computed(() => isLink.value && props.href?.startsWith('http'))
</script>

<template>
    <component
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
        :class="[
            'font-semibold  leading-none rounded-md cursor-pointer',
            size === 'lg' ? 'px-5 py-3'
            : size === 'icon' ? 'px-1 py-1'
            : 'px-2 py-1 text-sm',
            variant === 'solid' &&
                (color === 'red' ? 'bg-red-700 text-white hover:bg-red-950'
                : color === 'black' ? 'bg-black text-white hover:bg-gray-950'
                : 'bg-cyan-800 text-white hover:bg-cyan-900'),

            (variant === 'outline' || variant === 'text') &&
                (color === 'red' ? 'text-red-700 hover:text-red-800 hover:bg-red-50'
                : color === 'black' ? 'text-black hover:bg-gray-50'
                : 'text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800'),
            variant === 'outline' && 'border-2',
            variant === 'outline' &&
                (color === 'red' ? 'border-red-600'
                : color === 'black' ? 'border-black'
                : 'border-cyan-600'),
        ]"
        :rel="newTab ? 'noopener noreferrer' : undefined">
        <slot></slot
    ></component>
</template>

<style scoped lang="scss"></style>
