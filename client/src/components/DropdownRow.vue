<script setup lang="ts">
import { computed, ref } from 'vue'

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
            'bg-slate-800 w-full  font-medium text-left px-2 py-1  hover:bg-cyan-800 cursor-pointer focus-outline',
        ]">
        <slot></slot>
    </component>
</template>

<style scoped lang="scss"></style>
