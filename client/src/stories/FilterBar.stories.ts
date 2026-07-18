import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FilterBar from '../components/FilterBar.vue'
import { mocked } from 'storybook/test'
import { useMovies } from '../composables/useMovies.ts'
import { makeUseMoviesMock } from './support/useMovies.mock.ts'
import { reactive } from 'vue'

const meta = {
    title: 'FilterBar',
    component: FilterBar,
    tags: ['autodocs'],
    args: {
        modelValue: {
            filters: {
                genres: [],
                decades: [],
                languages: [],
                watched: null,
                director: null,
            },
            compactView: false,
        },
        counts: {
            shown: 12,
            total: 40,
        },
    },
    beforeEach: () => {
        mocked(useMovies).mockReturnValue(
            makeUseMoviesMock({
                filterOptions: reactive({
                    genres: ['Action', 'Adventure', 'Comedy', 'Science Fiction'],
                    decades: [1960, 1970, 1990, 2020].map((d) => ({ value: d, label: `${d}s` })),
                    languages: ['English', 'Portuguese'],
                    directors: [],
                }),
            }),
        )
    },
} satisfies Meta<typeof FilterBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
