import movies from '../movies-with-info-6.json'
import fs from 'fs/promises'

type Movie = (typeof movies)[number]
type MovieUpdate = {
    name: string
    description: string
    descriptionAlt?: string
    tagline?: string
    genres?: string[]
    letterboxId?: string
    letterboxUrl?: string
    originalTitle?: string
    tmdbId?: number
    posterPath?: string
    errors: string[]
}

const getMovieUpdate = (movie: Movie): MovieUpdate => {
    // let description = movie.overview
    let movieNew: MovieUpdate = {
        name: movie.name,
        errors: [],
        description: movie.overview || movie.desc || '',
    }
    if (movie.overview && movie.desc && movie.desc !== movie.overview) {
        movieNew.descriptionAlt = movie.desc
    }

    return {
        ...movieNew,
        genres: movie.genres || [],
        tagline: movie.tagline,
        letterboxId: movie.letterboxId,
        letterboxUrl: movie.letterboxUrl,
        originalTitle: movie.originalTitle,
        tmdbId: movie.tmdbId,
        posterPath: movie.poster ? `/${movie.poster}` : undefined,
        errors: [],
    }
}
async function main() {
    let file = await fs.readFile('src/data/movies-with-info-6.json', 'utf-8')
    let movies = JSON.parse(file)

    movies.forEach((movie: { genres?: string[] }) => {
        if (movie.genres) {
            movie.genres = movie.genres.filter((genre) => genre !== 'Show All…')
        }
    })

    let newMovies: MovieUpdate[] = movies.map((movie: Movie) => getMovieUpdate(movie))

    await fs.writeFile('src/data/movies-with-info.json', JSON.stringify(newMovies, null, 2))
}

main()
