import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AddMovie from '../components/AddMovie.vue'
import { useMovies } from '../composables/useMovies.ts'
import { mocked } from 'storybook/test'
import { makeUseMoviesMock } from './support/useMovies.mock.ts'

const meta = {
    title: 'AddMovie',
    component: AddMovie,
    tags: ['autodocs'],
    beforeEach: () => {
        mocked(useMovies).mockReturnValue(makeUseMoviesMock())
    },
} satisfies Meta<typeof AddMovie>

export default meta

type Story = StoryObj<typeof meta>

// Renders the trigger button; clicking it opens the search dialog.
// The TMDB search itself hits `/api/...`, which only resolves when the
// backend is reachable (run the app's dev proxy / docker stack).
export const Default: Story = {}
