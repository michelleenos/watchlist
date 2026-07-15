<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import CloseButton from './CloseButton.vue'
import { useModalOpen } from '../composables/useModalOpen.ts'

const contents = useTemplateRef('contents')

const props = withDefaults(
    defineProps<{
        autofocusContent?: boolean
    }>(),
    {
        autofocusContent: false,
    },
)

defineEmits<{
    requestClose: []
}>()

const { modalOpen } = useModalOpen()
const lockBody = () => document.body.classList.add('overflow-hidden')
const unlockBody = () => document.body.classList.remove('overflow-hidden')

onMounted(() => {
    lockBody()
    if (props.autofocusContent) contents.value?.focus()
    modalOpen.value = true
})

onUnmounted(() => {
    unlockBody()
    modalOpen.value = false
})
</script>

<template>
    <div class="fixed inset-0 z-99" @keydown.escape="$emit('requestClose')">
        <div
            class="fixed inset-0 -z-1 bg-black/60 backdrop-blur-sm"
            @click="$emit('requestClose')"></div>
        <div
            ref="contents"
            class="dialog-content border-brown-3009 z-999 mx-auto my-[10vh] w-11/12 max-w-2xl rounded-lg border"
            tabindex="-1">
            <div class="relative h-full w-full">
                <CloseButton class="absolute top-8 right-4" @click="$emit('requestClose')" />
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
