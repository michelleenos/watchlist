import fs from 'fs/promises'
import { getDir } from './utils'
import { getMovie } from './scrape/get-movie'
import type { MovieTypeFull } from './movie-type'
import { TMDB } from 'tmdb-ts'

async function getExisting() {
    const dir = getDir()
    const file = await fs.readFile(`${dir}/movies-more.json`, 'utf-8')
    const movies: MovieTypeFull[] = JSON.parse(file)
    return movies
}

// Stalker
// The Hunchback of Notre-Dame

// const filmsToGet = [
//     {
//         name: 'Maria',
//         tmdbId: 1038263,
//     },
// ]

async function main() {
    const movies = await getExisting()

    // for (const film of filmsToGet) {
    //     const existingIndex = movies.findIndex(
    //         (m) => m.name.toLowerCase() === film.name.toLowerCase(),
    //     )
    //     let existing: MovieTypeFull | null = null
    //     if (existingIndex !== -1) {
    //         existing = movies[existingIndex]
    //         movies.splice(existingIndex, 1)
    //     }

    //     const movieData = await getMovie({
    //         name: film.name,
    //         getImage: true,
    //         replaceImage: true,
    //         getLetterboxd: film.letterboxd ? true : false,
    //         letterboxdUrl: film.letterboxd,
    //         getTmdb: film.tmdbId ? true : false,
    //         tmdbId: film.tmdbId,
    //     })

    //     movies.push({
    //         ...(existing || {}),
    //         ...movieData,
    //     })
    // }

    const newMovies: MovieTypeFull[] = []
    const promises: Promise<MovieTypeFull>[] = []

    const updateMovie = async (movie: MovieTypeFull) => {
        const data = await getMovie({
            name: movie.name,
            tmdbId: movie.tmdbId,
            letterboxdUrl: movie.letterboxdUrl,
            getLetterboxd: true,
            getTmdb: true,
            getImage: false,
        })

        return {
            ...movie,
            ...data,
        }
    }

    for (const movie of movies) {
        // promises.push(updateMovie(movie))
        const updated = await updateMovie(movie)
        newMovies.push(updated)
    }
    // promises.push((async() => {
    // 	const data = await getMovie({
    //         name: movie.name,
    //         tmdbId: movie.tmdbId,
    //         letterboxdUrl: movie.letterboxdUrl,
    //         getLetterboxd: true,
    //         getTmdb: false,
    //         getImage: false,
    // 	})
    // 	return data
    // }))
    // const data = await getMovie({
    //     name: movie.name,
    //     tmdbId: movie.tmdbId,
    //     letterboxdUrl: movie.letterboxdUrl,
    //     getLetterboxd: true,
    //     getTmdb: false,
    //     getImage: false,
    // })

    newMovies.sort((a, b) => a.name.localeCompare(b.name))
    await fs.writeFile(`data/movies-new.json`, JSON.stringify(newMovies, null, 2))

    // console.log(movies.length)

    // const movie = await getMovie('Altered States')
    // movies.push(movie)
    // movies.sort((a, b) => a.name.localeCompare(b.name))
}

main()

async function checkTmdbResults() {
    const tmdb = new TMDB(process.env.TMDB_API_KEY!)

    const results = await tmdb.search.movies({ query: 'Mother' })
    console.log(results)
}

// checkTmdbResults()
