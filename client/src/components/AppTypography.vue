<script setup lang="ts">
import { computed } from 'vue'

type TypeVariant =
    | 'serif-lg'
    | 'serif-md'
    | 'serif-sm'
    | 'body-muted'
    | 'body-muted-sm'
    | 'tagline'
    | 'tagline-lg'
    | 'caps-mono'
    | 'body'
    | 'body-sm'

const tagDefaults: Record<TypeVariant, string> = {
    'serif-lg': 'h2',
    'serif-md': 'h3',
    'serif-sm': 'h3',
    'body-muted': 'p',
    'body-muted-sm': 'p',
    tagline: 'p',
    'tagline-lg': 'p',
    body: 'p',
    'caps-mono': 'div',
    'body-sm': 'p',
}

const VARIANT_CLASSES = {
    'serif-lg': 'text-4xl font-semibold font-serif leading-tight',
    'serif-md': 'text-xl lg:text-2xl font-serif leading-tight',
    'serif-sm': 'text-lg lg:text-xl font-serif leading-tight',
    'body-muted': 'text-brown-300',
    'body-muted-sm': 'text-sm text-brown-300',
    tagline: 'text-body font-serif leading-tight italic text-brass',
    'tagline-lg': 'text-lg lg:text-xl font-serif leading-tight italic text-brass',
    'caps-mono': 'text-brown-300 font-mono text-[10px] tracking-wide uppercase lg:text-[11px]',
    'body-sm': 'text-sm',
    body: '',
} satisfies Record<TypeVariant, string>

const props = withDefaults(defineProps<{ variant?: TypeVariant; tag?: string }>(), {
    tag: undefined,
    variant: 'body',
})

const resolvedTag = computed(() => props.tag ?? tagDefaults[props.variant])
</script>

<template>
    <component :is="resolvedTag" :class="VARIANT_CLASSES[variant]">
        <slot></slot>
    </component>
</template>

<style scoped lang="scss"></style>
