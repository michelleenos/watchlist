import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FilterItems from '../components/FilterItems.vue'

const meta = {
    title: 'FilterItems',
    // https://stackoverflow.com/questions/78037116/how-can-i-create-stories-for-generically-typed-vue-components
    component: FilterItems,
    tags: ['autodocs'],
    args: {
        label: 'Filter',
        options: ['Action', 'Comedy', 'Drama', 'Science Fiction'],
        modelValue: [],
        row: false,
    },
    argTypes: {
        options: {
            description:
                'Either array of values, or array of `{ value: string | number, label: string }` options',
        },
    },
    // render: (args) => ({
    //     components: { FilterItems },
    //     setup() {
    //         const selected = ref<string[]>([])
    //         return { args, selected }
    //     },
    //     template: `<FilterItems v-bind="args" v-model="selected" />`,
    // }),
} satisfies Meta<typeof FilterItems>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
