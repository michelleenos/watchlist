import path from 'path'
import fs from 'fs/promises'
import { MovieTypeFull } from '../movie-type.js'

const MOVIES_PATH = path.resolve(process.cwd(), './data/movies.json')
const BACKUPS_DIR = path.resolve(process.cwd(), './data/old')

export async function backupMovies() {
    const current = await getMoviesString()
    const date = new Date()
    const datename = date.toISOString().replaceAll('.', '_')
    await fs.writeFile(`${BACKUPS_DIR}/${datename}-movies.json`, current)
}

export async function updateMovies(data: MovieTypeFull[]) {
    await backupMovies()
    await fs.writeFile(MOVIES_PATH, JSON.stringify(data))
}

export async function getMoviesString() {
    return await fs.readFile(MOVIES_PATH, 'utf8')
}

export async function getMovies() {
    return JSON.parse(await getMoviesString()) as MovieTypeFull[]
}

export async function getMovie(id: string) {
    const movies = await getMovies()
    const movieIndex = movies.findIndex((m) => m.id === id)
    if (movieIndex >= 0) return movies[movieIndex]
    return false
}

export async function deleteMovie(id: string) {
    const movies = await getMovies()
    const movieIndex = movies.findIndex((m) => m.id === id)

    if (movieIndex >= 0) {
        movies.splice(movieIndex, 1)
        await updateMovies(movies)
        return true
    }
    return false
}

export async function addMovie(movie: MovieTypeFull) {
    const movies = await getMovies()
    const newMovies = [...movies, movie].sort((a, b) => {
        return a.name.localeCompare(b.name)
    })

    await updateMovies(newMovies)
    return movie
}
