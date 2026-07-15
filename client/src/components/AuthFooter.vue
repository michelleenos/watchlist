<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import AppBtn from './AppBtn.vue'
import AppDialog from './AppDialog.vue'
import AppTypography from './AppTypography.vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

const { authState, login, logout } = useAuth()
const toasts = useToast()
const dialog = useTemplateRef('dialog')
// const usernameInput = useTemplateRef('username-input')

const username = ref('')
const password = ref('')
const submitting = ref(false)

const open = () => {
    dialog.value?.open()
    // usernameInput.value?.focus()
}

const onClose = () => {
    username.value = ''
    password.value = ''
}

async function submit() {
    if (!username.value.trim() || !password.value || submitting.value) return
    submitting.value = true
    const ok = await login(username.value.trim(), password.value)
    submitting.value = false
    if (ok) {
        toasts.add({ html: `logged in as <strong>${authState.user?.username}</strong>` })
        dialog.value?.close()
    } else {
        toasts.add('login failed', 'error')
    }
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
                    class="cursor-pointer transition-colors hover:text-brown-300"
                    @click="onLogout">
                    log out
                </button>
            </template>
            <button
                v-else
                class="cursor-pointer transition-colors hover:text-brown-300"
                @click="open">
                log in
            </button>
        </div>
    </footer>

    <AppDialog ref="dialog" @close="onClose">
        <form class="flex flex-col gap-6 px-8 py-8" @submit.prevent="submit">
            <AppTypography variant="caps-mono">Log In</AppTypography>

            <label class="flex flex-col gap-2 text-sm text-brown-400">
                Username
                <input
                    v-model="username"
                    required
                    autofocus
                    type="text"
                    name="username"
                    autocomplete="username"
                    class="text-input" />
            </label>

            <label class="flex flex-col gap-2 text-sm text-brown-400">
                Password
                <input
                    v-model="password"
                    required
                    type="password"
                    name="password"
                    autocomplete="current-password"
                    class="text-input w-full min-w-0" />
            </label>

            <div class="flex justify-end">
                <AppBtn type="submit" :disabled="submitting">
                    {{ submitting ? 'Logging in…' : 'Log in' }}
                </AppBtn>
            </div>
        </form>
    </AppDialog>
</template>
