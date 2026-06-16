import { getMovies } from './movies.js'

export async function getDecades() {
    const movies = await getMovies()
    const decades = new Set<number>()

    movies.forEach((movie) => {
        if (!movie.year) return
        const decade = movie.year - (movie.year % 10)
        decades.add(decade)
    })

    return [...decades].sort((a, b) => a - b)
}
