<script setup lang="ts">
import { computed } from 'vue'

type TypeVariant =
    | 'serif-lg'
    | 'serif-sm'
    | 'body-muted'
    | 'body-muted-sm'
    | 'tagline'
    | 'tagline-lg'
    | 'caps'
    | 'base'

const tagDefaults: Record<TypeVariant, string> = {
    'serif-lg': 'h2',
    'serif-sm': 'h3',
    'body-muted': 'p',
    'body-muted-sm': 'p',
    tagline: 'p',
    'tagline-lg': 'p',
    base: 'p',
    caps: 'div',
}

const VARIANT_CLASSES = {
    'serif-lg': 'text-4xl font-semibold font-serif leading-tight',
    'serif-sm': 'text-xl lg:text-2xl font-serif leading-tight',
    'body-muted': 'text-brown-300',
    'body-muted-sm': 'text-sm text-taupe-400',
    tagline: 'text-base font-serif leading-tight italic text-brass',
    'tagline-lg': 'text-lg lg:text-xl font-serif leading-tight italic text-brass',
    caps: 'text-taupe-300 font-mono text-[10px] tracking-widest uppercase lg:text-[11px]',
    base: '',
} satisfies Record<TypeVariant, string>

const props = withDefaults(defineProps<{ variant?: TypeVariant; tag?: string }>(), {
    tag: undefined,
    variant: 'base',
})

const resolvedTag = computed(() => props.tag ?? tagDefaults[props.variant])
</script>

<template>
    <component :is="resolvedTag" :class="VARIANT_CLASSES[variant]">
        <slot></slot>
    </component>
</template>

<style scoped lang="scss"></style>
