import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FilterBar from '../components/FilterBar.vue'
import { mocked } from 'storybook/test'
import { useMovies } from '@/composables/useMovies.ts'
import { ref } from 'vue'

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
        shownCounts: '12 / 40',
    },
    beforeEach: () => {
        mocked(useMovies).mockReturnValue({
            moviesData: {
                movies: [],
                genres: ['Action', 'Adventure', 'Comedy', 'Science Fiction'],
                decades: [1960, 1970, 1990, 2020].map((d) => ({ value: d, label: `${d}s` })),
                languages: ['English', 'Portuguese'],
            },
            error: ref(false),
            loading: ref(false),
            refresh: () => new Promise<void>((res) => res()),
        })
    },
} satisfies Meta<typeof FilterBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
