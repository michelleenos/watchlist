import { reactive, ref } from 'vue'
import type { useAuth } from '../../composables/useAuth'
import { fn } from 'storybook/test'
import type { AuthStatus, User } from '../../types'

type UseAuthReturn = ReturnType<typeof useAuth>

const mockUser: User = { username: 'mock-user' }
export function makeUseAuthMock(
    loggedIn = true,
    overrides: Partial<UseAuthReturn> = {},
): UseAuthReturn {
    const authState = reactive<AuthStatus>(
        loggedIn ?
            {
                authenticated: true,
                user: mockUser,
            }
        :   { authenticated: false, user: null },
    )

    return {
        authState,
        loading: ref(false),
        error: ref(false),
        login: fn(async () => {
            authState.authenticated = true
            authState.user = mockUser
            return true
        }).mockName('login'),
        logout: fn(async () => {
            authState.authenticated = false
            authState.user = null
        }).mockName('logout'),
        refresh: fn(async () => {}).mockName('refresh'),
        ...overrides,
    }
}
