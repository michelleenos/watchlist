import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MovieCard from '../components/MovieCard.vue'
import { sampleMovieArg } from './support/movies.fixtures.ts'
import type { MovieFull } from '../types/index.ts'
import { fn } from 'storybook/test'

const meta = {
    title: 'MovieCard',
    component: MovieCard,
    tags: ['autodocs'],
    args: {
        movie: sampleMovieArg.options[0] as unknown as MovieFull,
        style: 'default',
        onFilterSelect: fn(),
    },
    argTypes: {
        movie: {
            control: 'select',
            options: sampleMovieArg.options,
            mapping: sampleMovieArg.mapping,
        },
        style: {
            control: 'select',
            options: ['default', 'compact'],
        },
    },
} satisfies Meta<typeof MovieCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
