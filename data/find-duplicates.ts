import fs from 'fs/promises'
import type { MovieTypeFull } from './movie-type'

async function main() {
    const file = await fs.readFile(`data/movies-more.json`, 'utf-8')
    const movies = JSON.parse(file) as MovieTypeFull[]

    const results: MovieTypeFull[] = []

    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i]
        const lbDesc = movie.letterboxdDescription
        const tmbdDesc = movie.tmdbOverview
        if (lbDesc && tmbdDesc && lbDesc !== tmbdDesc) {
            results.push(movie)
            console.log(movie.name)
        }
    }

    console.log(results)
}

// main()

// Ad Astra
// Babel
// Babygirl
// Birdman
// Disobedience
// I'm Not a Robot
// I'm Still Here
// Iris
// Lee
// Lucy
// Maria
// Mother
// Oblivion
// Oppenheimer
// Poor Things
// Sense and Sensibility
// Stalker
// The Favorite
// The Hunchback of Notre-Dame
// The Room Next Door
// Under the Skin
