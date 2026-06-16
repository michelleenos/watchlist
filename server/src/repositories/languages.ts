import { getMovies } from './movies.js'

export async function getLanguages() {
    const movies = await getMovies()
    const languages = new Set<string>()
    movies.forEach((movie) => {
        if (movie.language) languages.add(movie.language)
    })
    return [...languages].sort((a, b) => a.localeCompare(b))
}
