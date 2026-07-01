import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AppTypography from '../components/AppTypography.vue'

const variants = [
    'serif-lg',
    'serif-sm',
    'body',
    'body-sm',
    'body-muted',
    'body-muted-sm',
    'tagline',
    'tagline-lg',
    'caps',
] as const

const meta = {
    title: 'AppTypography',
    component: AppTypography,
    tags: ['autodocs'],
    argTypes: {
        variant: { control: 'select', options: variants },
        tag: { control: 'text' },
    },
    args: {
        variant: 'body',
    },
    render: (args) => ({
        components: { AppTypography },
        setup: () => ({ args }),
        template: `<AppTypography v-bind="args">The quick brown fox jumps over the lazy dog</AppTypography>`,
    }),
} satisfies Meta<typeof AppTypography>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Every variant stacked, to eyeball the scale at a glance.
// This story ignores args, so hide the controls panel.
export const AllVariants: Story = {
    parameters: {
        controls: { disable: true },
    },
    render: () => ({
        components: { AppTypography },
        setup: () => ({ variants }),
        template: `
            <div class="flex flex-col gap-4">
                <div v-for="v in variants" :key="v">
                    <span class="font-mono text-[10px] text-mauve-300">{{ v }}</span>
                    <AppTypography :variant="v">The quick brown fox jumps over the lazy dog</AppTypography>
                </div>
            </div>
        `,
    }),
}
