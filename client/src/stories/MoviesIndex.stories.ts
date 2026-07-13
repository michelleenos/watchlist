import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MoviesIndex from '../pages/MoviesIndex.vue'
import { mocked } from 'storybook/test'
import { useMovies } from '../composables/useMovies.ts'
import { useAuth } from '../composables/useAuth.ts'
import { makeUseMoviesMock } from './support/useMovies.mock.ts'
import { makeUseAuthMock } from './support/useAuth.mock.ts'

const meta = {
    title: 'Pages/MoviesIndex',
    component: MoviesIndex,
    beforeEach: () => {
        mocked(useMovies).mockReturnValue(makeUseMoviesMock())
        mocked(useAuth).mockReturnValue(makeUseAuthMock())
    },
} satisfies Meta<typeof MoviesIndex>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
