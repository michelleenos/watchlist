<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import AppTypography from './AppTypography.vue'
import AppBtn from './AppBtn.vue'

const props = defineProps<{
    /**
     * autofocus the username input on mount
     */
    autofocusInput?: boolean
}>()

const { login, authState } = useAuth()
const toasts = useToast()

const username = ref('')
const password = ref('')
const submitting = ref(false)
const usernameInput = useTemplateRef('username-input')
const attemptFailed = ref(false)

const emit = defineEmits<{
    loginSuccess: []
    loginFail: []
}>()

// TODO fix issue where initial enter press after tabbing through inputs does not submit (unless you click around, tab back first, etc)

async function submit() {
    if (submitting.value || !username.value.trim() || !password.value) return
    submitting.value = true
    const ok = await login(username.value.trim(), password.value)
    submitting.value = false
    if (ok) {
        toasts.add({ html: `logged in as <strong>${authState.user?.username}</strong>` })
        emit('loginSuccess')
        clearValues()
    } else {
        toasts.add('login failed', 'error')
        attemptFailed.value = true
        emit('loginFail')
    }
}

function clearValues() {
    username.value = ''
    password.value = ''
}

function focusInput() {
    usernameInput.value?.focus()
}

defineExpose({ focusInput })

onMounted(() => {
    if (props.autofocusInput) usernameInput.value?.focus()
})
</script>

<template>
    <form method="POST" class="flex flex-col gap-6" @submit.prevent="submit">
        <AppTypography tag="h2" variant="caps-mono">Log In</AppTypography>

        <label class="flex flex-col gap-2 text-sm text-brown-400">
            Username
            <input
                ref="username-input"
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
            <AppTypography
                v-if="attemptFailed"
                variant="body-sm"
                class="mr-auto self-center text-red-400"
                >Invalid credentails</AppTypography
            >

            <AppBtn type="submit" :disabled="submitting">
                {{ submitting ? 'Logging in…' : 'Log in' }}
            </AppBtn>
        </div>
    </form>
</template>

<style scoped lang="scss"></style>
