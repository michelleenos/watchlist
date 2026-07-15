<script setup lang="ts">
import AppTypography from './AppTypography.vue'

withDefaults(
    defineProps<{
        label: string
        /** Visually hide the label text (still read by screen readers). */
        hideLabel?: boolean
    }>(),
    { hideLabel: false },
)

const checked = defineModel<boolean>({ required: true })
</script>

<template>
    <label class="flex cursor-pointer items-center gap-2">
        <AppTypography tag="span" variant="caps-mono" :class="hideLabel ? 'sr-only' : ''">
            {{ label }}
        </AppTypography>
        <input v-model="checked" type="checkbox" class="peer sr-only" />
        <span
            aria-hidden="true"
            class="relative h-5 w-9 rounded-full bg-brown-800 transition-colors peer-checked:bg-brass peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brass after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-brown-300 after:transition-transform peer-checked:after:translate-x-4 peer-checked:after:bg-brown-950" />
    </label>
</template>
