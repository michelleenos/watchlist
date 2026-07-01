import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MovieCard from '../components/MovieCard.vue'
import type { MovieFull } from '../types/index.ts'

const sampleMovie: MovieFull = {
    name: '2001: A Space Odyssey',
    year: 1968,
    language: 'English',
    tagline: 'An epic drama of adventure and exploration.',
    genres: ['Science Fiction', 'Mystery', 'Adventure'],
    description:
        "Humanity finds a mysterious object buried beneath the lunar surface and sets off to find its origins with the help of HAL 9000, the world's most advanced super computer.",
    id: 1,
    posterPath: '/2001-a-space-odyssey.webp',
    issues: [],
}

const meta = {
    title: 'MovieCard',
    component: MovieCard,
    tags: ['autodocs'],
    args: {
        movie: sampleMovie,
    },
} satisfies Meta<typeof MovieCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
