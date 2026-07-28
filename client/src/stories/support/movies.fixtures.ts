import type { MovieFull } from '../../types'

export const sampleMovies: MovieFull[] = [
    {
        name: '2001: A Space Odyssey',
        year: 1968,
        language: 'English',
        tagline: 'An epic drama of adventure and exploration.',
        genres: ['Science Fiction', 'Mystery', 'Adventure'],
        runtime: 120,
        description:
            "Humanity finds a mysterious object buried beneath the lunar surface and sets off to find its origins with the help of HAL 9000, the world's most advanced super computer.",
        id: 1,
        posterPath: '/2001-a-space-odyssey.webp',
        issues: [],
        watched: false,
        addedBy: 'Mish',
        directors: ['Stanley Kubrick'],
        createdAt: '2026-06-29 01:00:15.44678+00',
        castMembers: [
            { name: 'Keir Dullea', role: 'Dr. David Bowman' },
            { name: 'Gary Lockwood', role: 'Dr. Frank Poole' },
            { name: 'William Sylvester', role: 'Dr. Heywood Floyd' },
            { name: 'Douglas Rain', role: 'HAL 9000 (voice)' },
            { name: 'Daniel Richter', role: 'Moonwatcher' },
        ],
        writers: ['Arthur C. Clarke', 'Stanley Kubrick'],
    },
    {
        name: "Breakfast at Tiffany's",
        year: 1961,
        language: 'English',
        runtime: 110,
        tagline:
            'Audrey Hepburn plays that daring, darling Holly Golightly to a new high in entertainment delight!',
        genres: ['Comedy', 'Romance', 'Drama'],
        description:
            'Holly Golightly is an eccentric New York City playgirl determined to marry a Brazilian millionaire. But when young writer Paul Varjak moves into her apartment building, her past threatens to get in their way.',
        createdAt: '2026-06-29 01:00:15.44678+00',

        id: 2,
        issues: [],
        posterPath: '/breakfast-at-tiffanys.webp',
        watched: false,
        addedBy: 'Mish',
        writers: ['George Axelrod'],
        sourceAuthors: ['Truman Capote'],
        castMembers: [
            { name: 'Audrey Hepburn', role: 'Holly Golightly' },
            { name: 'George Peppard', role: 'Paul Varjak' },
            { name: 'Patricia Neal', role: '2E Failenson' },
            { name: 'Buddy Ebsen', role: 'Doc Golightly' },
            { name: 'Martin Balsam', role: 'O.J. Berman' },
        ],
        directors: ['Blake Edwards'],
    },
    {
        name: "I'm Still Here",
        year: 2024,
        runtime: 110,
        language: 'Portuguese',
        tagline: "When a mother's courage defies tyranny, hope is reborn.",
        genres: ['Drama', 'History'],
        description:
            'A woman married to a former politician during the 1971 military dictatorship in Brazil is forced to reinvent herself and chart a new course for her family after a violent and arbitrary act.',
        originalTitle: 'Ainda Estou Aqui',
        issues: [],
        id: 3,
        watched: false,
        addedBy: 'Mish',
        directors: ['Walter Salles'],
        writers: ['Murilo Hauser', 'Heitor Lorega'],
        castMembers: [
            { name: 'Fernanda Torres', role: 'Eunice Paiva' },
            { name: 'Fernanda Montenegro', role: 'Eunice Paiva (Older)' },
            { name: 'Selton Mello', role: 'Rubens Paiva' },
            { name: 'Valentina Herszage', role: 'Veroca' },
            { name: 'Maria Manoella', role: 'Veroca' },
        ],
        createdAt: '2026-06-29 01:00:15.44678+00',
    },
]

export const sampleFilterOptions = {
    genres: ['Adventure', 'Comedy', 'Drama', 'History', 'Mystery', 'Romance', 'Science Fiction'],
    decades: [1960, 2020].map((d) => ({ value: d, label: `${d}s` })),
    languages: ['English', 'Portuguese'],
    directors: [],
}

export const sampleMovieArg = {
    mapping: sampleMovies.reduce(
        (mapping, current) => {
            return {
                ...mapping,
                [current.name]: current,
            }
        },
        {} as { [key: string]: MovieFull },
    ),
    options: sampleMovies.map((m) => m.name),
}
