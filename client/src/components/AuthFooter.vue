<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import AppModal from './AppModal.vue'
import AuthLoginForm from './AuthLoginForm.vue'

const { authState, logout } = useAuth()
const toasts = useToast()
const modalShown = ref(false)
const button = useTemplateRef('button')

const open = () => {
    modalShown.value = true
}

const onClose = () => {
    button.value?.focus()
}

function closeModal() {
    modalShown.value = false
    onClose()
}

async function onLogout() {
    await logout()
    toasts.add('logged out')
}
</script>

<template>
    <footer
        class="mx-auto w-full max-w-11/12 border-t border-subtle py-6 text-xs text-brown-500 2xl:max-w-352">
        <div class="flex items-center justify-end gap-2">
            <template v-if="authState.authenticated">
                <span>
                    logged in as
                    <span class="font-semibold text-brown-400">{{ authState.user?.username }}</span>
                </span>
                <span aria-hidden="true">·</span>
                <button
                    ref="button"
                    class="focus-visible-outline cursor-pointer transition-colors hover:text-brown-300"
                    @click="onLogout">
                    log out
                </button>
            </template>
            <button
                v-else
                ref="button"
                class="focus-visible-outline cursor-pointer transition-colors hover:text-brown-300"
                @click="open">
                log in
            </button>
        </div>
    </footer>

    <AppModal v-if="modalShown" ref="dialog" @request-close="closeModal">
        <AuthLoginForm :autofocus-input="true" class="p-8" @login-success="closeModal()" />
    </AppModal>
</template>
