<script setup lang="ts">
import { computed } from 'vue'

type DropdownButtonProps = {
    href?: string
    /**
     * open in new tab (only used if href is defined)
     */
    newTab?: boolean
    ariaLabel?: string
}

const props = withDefaults(defineProps<DropdownButtonProps>(), {
    newTab: false,
    ariaLabel: '',
    href: undefined,
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
            'focus-outline w-full cursor-pointer bg-slate-800 px-2 py-1 text-left font-medium hover:bg-cyan-800',
        ]">
        <slot></slot>
    </component>
</template>

<style scoped lang="scss"></style>
