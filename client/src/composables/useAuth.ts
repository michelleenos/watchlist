import { reactive, ref } from 'vue'
import type { UserAuthenticated, UserUnauthenticated, AuthStatus } from '../types'

const authState = reactive<AuthStatus>({
    authenticated: false,
    user: null,
})
const loading = ref(false)
const error = ref(false)

function setAuthState(status: AuthStatus) {
    authState.authenticated = status.authenticated
    authState.user = status.user ?? null
}

async function fetchAuthStatus() {
    loading.value = true
    try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) throw new Error(`GET /auth/me failed (${res.status})`)
        setAuthState((await res.json()) as AuthStatus)
        error.value = false
    } catch (err) {
        console.error(err)
        error.value = true
    } finally {
        loading.value = false
    }
}

async function login(username: string, password: string): Promise<boolean> {
    loading.value = true
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
        if (!res.ok) return false
        setAuthState((await res.json()) as UserAuthenticated)
        return true
    } catch (err) {
        console.error(err)
        error.value = true
        return false
    } finally {
        loading.value = false
    }
}

async function logout() {
    loading.value = true
    try {
        const res = await fetch('/api/auth/logout', { method: 'POST' })
        if (!res.ok) throw new Error(`POST /auth/logout failed (${res.status})`)
        setAuthState((await res.json()) as UserUnauthenticated)
    } catch (err) {
        console.error(err)
        error.value = true
    } finally {
        loading.value = false
    }
}

let initialized = false

export function useAuth() {
    if (!initialized) {
        initialized = true
        fetchAuthStatus()
    }
    // TODO wrap stuff in readonly
    return { authState, login, logout, refresh: fetchAuthStatus, loading, error }
}
