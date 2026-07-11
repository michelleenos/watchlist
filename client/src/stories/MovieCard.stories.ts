import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MovieCard from '../components/MovieCard.vue'
import { sampleMovies } from './support/movies.fixtures.ts'
import type { MovieFull } from '../types/index.ts'

const sampleMovieMapping = sampleMovies.reduce(
    (mapping, current) => {
        return {
            ...mapping,
            [current.name]: current,
        }
    },
    {} as { [key: string]: MovieFull },
)
const sampleMovieOptions = sampleMovies.map((m) => m.name)

const meta = {
    title: 'MovieCard',
    component: MovieCard,
    tags: ['autodocs'],
    args: {
        movie: sampleMovieOptions[0] as unknown as MovieFull,
    },
    argTypes: {
        movie: {
            control: 'select',
            options: sampleMovieOptions,
            mapping: sampleMovieMapping,
        },
    },
    // render: (args) => ({
    // 	components: { MovieCard },
    // 	setup: () => {
    // 		const movie = sampleMovieMapping[args.movie]
    // 	},
    // 	// template:
    // })
} satisfies Meta<typeof MovieCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
