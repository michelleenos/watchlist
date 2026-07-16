<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import CloseButton from './CloseButton.vue'

const panelEl = useTemplateRef('panel')

defineEmits<{
    requestClose: []
}>()

const lockBody = () => document.body.classList.add('overflow-hidden')
const unlockBody = () => document.body.classList.remove('overflow-hidden')

onMounted(() => {
    lockBody()
    panelEl.value?.focus()
})

onUnmounted(() => {
    unlockBody()
})

// TODO give this some enter animation
</script>

<template>
    <div class="fixed inset-0 z-99" @keydown.escape="$emit('requestClose')">
        <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm"
            @click="$emit('requestClose')"></div>
        <div
            ref="panel"
            tabindex="-1"
            class="dialog-content fixed top-0 right-0 bottom-0 ml-auto h-screen max-h-screen w-full max-w-150 outline-none md:w-8/12 md:border-l lg:w-6/12">
            <CloseButton class="absolute top-8 right-4" @click="$emit('requestClose')" />
            <div class="relative h-full w-full overflow-y-auto">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
