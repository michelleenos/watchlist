import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MovieMetaDl from '../components/MovieMetaDl.vue'
import { sampleMovieArg } from './support/movies.fixtures.ts'
import type { MovieFull } from '../types/index.ts'

// const sampleMovieMapping = sampleMovies.reduce(
//     (mapping, current) => {
//         return {
//             ...mapping,
//             [current.name]: current,
//         }
//     },
//     {} as { [key: string]: MovieFull },
// )
// const sampleMovieOptions = sampleMovies.map((m) => m.name)

const meta = {
    title: 'MovieMetaDl',
    component: MovieMetaDl,
    tags: ['autodocs'],
    args: {
        movie: sampleMovieArg.options[0] as unknown as MovieFull,
        stackedRows: false,
        include: ['year', 'language', 'runtime', 'directors'],
    },
    argTypes: {
        include: {
            // control: 'multi-select',
            control: 'inline-check',
            options: [
                'year',
                'language',
                'runtime',
                'directors',
                'castMembers',
                'writers',
                'sourceAuthors',
                'addedBy',
            ],
        },
        movie: {
            control: 'select',
            options: sampleMovieArg.options,
            mapping: sampleMovieArg.mapping,
        },
    },
} satisfies Meta<typeof MovieMetaDl>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Stacked: Story = {
    args: {
        stackedRows: true,
        include: ['directors', 'castMembers', 'writers', 'sourceAuthors'],
    },
}
