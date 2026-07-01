import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AppBtn from '../components/AppBtn.vue'

const meta = {
    title: 'AppBtn',
    component: AppBtn,
    tags: ['autodocs'],
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'lg'] },
        destructive: { control: 'boolean' },
        href: { control: 'text' },
        newTab: { control: 'boolean' },
    },
    args: {
        size: 'sm',
        destructive: false,
    },
    render: (args) => ({
        components: { AppBtn },
        setup: () => ({ args }),
        template: `<AppBtn v-bind="args">Add Movie</AppBtn>`,
    }),
} satisfies Meta<typeof AppBtn>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Large: Story = {
    args: { size: 'lg' },
}

export const Destructive: Story = {
    args: { destructive: true },
    render: (args) => ({
        components: { AppBtn },
        setup: () => ({ args }),
        template: `<AppBtn v-bind="args">Remove</AppBtn>`,
    }),
}

// href renders the button as an internal RouterLink.
export const AsLink: Story = {
    args: { href: '/movie/1' },
}
