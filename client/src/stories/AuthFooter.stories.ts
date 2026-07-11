import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AuthFooter from '@/components/AuthFooter.vue'
import { mocked } from 'storybook/test'
import { useAuth } from '@/composables/useAuth'
import { makeUseAuthMock } from './support/useAuth.mock'

const meta = {
    title: 'AuthFooter',
    component: AuthFooter,
    beforeEach: () => {
        mocked(useAuth).mockReturnValue(makeUseAuthMock())
    },
} satisfies Meta<typeof AuthFooter>

export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
