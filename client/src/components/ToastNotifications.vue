<script setup lang="ts">
import { useToast } from '../composables/useToast.ts'
import CloseButton from './CloseButton.vue'

const { toasts, dismiss } = useToast()
</script>

<template>
    <TransitionGroup
        name="toasts"
        tag="div"
        class="pointer-events-none fixed top-6 right-6 bottom-6 left-6 z-999 flex w-72 max-w-72 flex-col justify-end gap-2">
        <div
            v-for="toast in toasts"
            :key="toast.id"
            class="pointer-events-auto flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg"
            :class="
                toast.type === 'error' ?
                    'border-red-800 bg-brown-900 text-red-200'
                :   'border-brown-700 bg-brown-900 text-brown-100'
            ">
            <span v-if="typeof toast.message === 'string'">{{ toast.message }}</span>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-else v-html="toast.message.html" />
            <CloseButton @click="() => dismiss(toast.id)" />
        </div>
    </TransitionGroup>
</template>

<style lang="css">
.toasts-move,
.toasts-enter-active,
.toasts-leave-active {
    transition: all 1s ease;
}

.toasts-enter-from,
.toasts-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.toasts-leave-active {
    position: absolute;
}
</style>
