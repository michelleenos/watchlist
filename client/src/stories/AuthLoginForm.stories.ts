import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AuthLoginForm from '../components/AuthLoginForm.vue'
import { fn, mocked } from 'storybook/test'
import { useAuth } from '../composables/useAuth'
import { makeUseAuthMock } from './support/useAuth.mock'

const meta = {
    title: 'AuthLoginForm',
    component: AuthLoginForm,
    tags: ['autodocs'],
    args: {
        autofocusInput: false,
    },
    beforeEach: () => {
        mocked(useAuth).mockReturnValue(makeUseAuthMock())
    },
} satisfies Meta<typeof AuthLoginForm>

export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}

export const LoginError: Story = {
    beforeEach: () => {
        mocked(useAuth).mockReturnValue(
            makeUseAuthMock(false, {
                login: fn(
                    () =>
                        new Promise<boolean>((resolve) => {
                            setTimeout(() => resolve(false), 500)
                        }),
                ).mockName('login'),
            }),
        )
    },
}
