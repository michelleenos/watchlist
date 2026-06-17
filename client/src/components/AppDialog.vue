<script setup lang="ts">
import { useTemplateRef } from 'vue'
import CloseButton from './CloseButton.vue'

defineProps<{
    pageSide?: boolean
}>()

const emit = defineEmits<{
    close: []
    open: []
}>()

const dialog = useTemplateRef('dialog')

defineExpose({
    dialog,
    close: () => {
        dialog.value?.close()
    },
    open: () => {
        dialog.value?.showModal()
    },
})

const closeDialog = () => {
    dialog.value?.close()
    emit('close')
}
</script>

<template>
    <dialog
        ref="dialog"
        class="border-brown-900 bg-transparent bg-linear-to-tr from-taupe-950/50 to-brown-950 text-brown-100 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        :class="
            pageSide ?
                'fixed top-0 right-0 bottom-0 ml-auto h-screen max-h-screen w-full max-w-150 md:w-8/12 md:border-l lg:w-6/12'
            :   'mx-auto my-[10vh] w-11/12 max-w-2xl rounded-lg border border-brown-800'
        "
        @click="
            (e) => {
                if (e.target === dialog) closeDialog()
            }
        "
        @cancel="closeDialog">
        <div class="relative h-full w-full">
            <CloseButton class="absolute top-8 right-4" @click="closeDialog" />
            <slot></slot>
        </div>
    </dialog>
</template>
