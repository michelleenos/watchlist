import { type MovieTypeFull } from '../movie-type.js'
import { getCurrentMovies, updateData } from '../utils.js'

export async function deleteMovie(id: string) {
    const movies = (await getCurrentMovies()) as MovieTypeFull[]

    const movieIndex = movies.findIndex((m) => {
        return m.id === id
    })

    if (movieIndex >= 0) {
        movies.splice(movieIndex, 1)
        await updateData(JSON.stringify(movies, null, 2), 'movies.json')
        return true
    } else {
        return false
    }
}
