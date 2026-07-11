import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AddMovie from '../components/AddMovie.vue'
import { useMovies } from '@/composables/useMovies.ts'
import { mocked } from 'storybook/test'
import { sampleMovies } from '@/stories/support/movies.fixtures.ts'
import { ref } from 'vue'

const meta = {
    title: 'AddMovie',
    component: AddMovie,
    tags: ['autodocs'],
    beforeEach: () => {
        mocked(useMovies).mockReturnValue({
            moviesData: {
                movies: sampleMovies,
                genres: [
                    'Adventure',
                    'Comedy',
                    'Drama',
                    'History',
                    'Mystery',
                    'Romance',
                    'Science Fiction',
                ],
                decades: [1960, 2020].map((d) => ({ value: d, label: `${d}s` })),
                languages: ['English', 'Portuguese'],
            },
            refresh: async () => {},
            error: ref(false),
            loading: ref(false),
        })
    },
} satisfies Meta<typeof AddMovie>

export default meta

type Story = StoryObj<typeof meta>

// Renders the trigger button; clicking it opens the search dialog.
// The TMDB search itself hits `/api/...`, which only resolves when the
// backend is reachable (run the app's dev proxy / docker stack).
export const Default: Story = {}
