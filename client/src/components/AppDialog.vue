<script setup lang="ts">
import { onUnmounted, useTemplateRef } from 'vue'
import CloseButton from './CloseButton.vue'

defineProps<{
    pageSide?: boolean
}>()

const emit = defineEmits<{
    close: []
    open: []
}>()

const dialog = useTemplateRef('dialog')

const lockBody = () => document.body.classList.add('overflow-hidden')
const unlockBody = () => document.body.classList.remove('overflow-hidden')

const open = () => {
    dialog.value?.showModal()
    lockBody()
    emit('open')
}

const close = () => {
    dialog.value?.close()
}

const onClose = () => {
    unlockBody()
    emit('close')
}

onUnmounted(unlockBody)

defineExpose({ open, close })
</script>

<template>
    <dialog
        ref="dialog"
        class="dialog"
        :class="
            pageSide ?
                'fixed top-0 right-0 bottom-0 ml-auto h-screen max-h-screen w-full max-w-150 md:w-8/12 md:border-l lg:w-6/12'
            :   'mx-auto my-[10vh] w-11/12 max-w-2xl rounded-lg border'
        "
        @close="onClose"
        @click="
            (e) => {
                if (e.target === dialog) close()
            }
        ">
        <div class="relative h-full w-full">
            <CloseButton class="absolute top-8 right-4" @click="close" />
            <slot></slot>
        </div>
    </dialog>
</template>
