import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FilterBar from '../components/FilterBar.vue'

const meta = {
    title: 'FilterBar',
    component: FilterBar,
    tags: ['autodocs'],
    args: {
        modelValue: {
            genres: [],
            decades: [],
            languages: [],
        },
    },
} satisfies Meta<typeof FilterBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
