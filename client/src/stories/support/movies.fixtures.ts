import type { MovieFull } from '../../types'

export const sampleMovies: MovieFull[] = [
    {
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
    },
    {
        name: "Breakfast at Tiffany's",
        year: 1961,
        language: 'English',
        tagline:
            'Audrey Hepburn plays that daring, darling Holly Golightly to a new high in entertainment delight!',
        genres: ['Comedy', 'Romance', 'Drama'],
        description:
            'Holly Golightly is an eccentric New York City playgirl determined to marry a Brazilian millionaire. But when young writer Paul Varjak moves into her apartment building, her past threatens to get in their way.',

        id: 2,
        issues: [],
        posterPath: '/breakfast-at-tiffanys.webp',
    },
    {
        name: "I'm Still Here",
        year: 2024,
        language: 'Portuguese',
        tagline: "When a mother's courage defies tyranny, hope is reborn.",
        genres: ['Drama', 'History'],
        description:
            'A woman married to a former politician during the 1971 military dictatorship in Brazil is forced to reinvent herself and chart a new course for her family after a violent and arbitrary act.',
        originalTitle: 'Ainda Estou Aqui',
        issues: [],
        id: 3,
    },
]

export const sampleFilterOptions = {
    genres: ['Adventure', 'Comedy', 'Drama', 'History', 'Mystery', 'Romance', 'Science Fiction'],
    decades: [1960, 2020].map((d) => ({ value: d, label: `${d}s` })),
    languages: ['English', 'Portuguese'],
}
