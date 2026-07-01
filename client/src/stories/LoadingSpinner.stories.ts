import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const meta = {
    title: 'LoadingSpinner',
    component: LoadingSpinner,
    tags: ['autodocs'],
} satisfies Meta<typeof LoadingSpinner>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
