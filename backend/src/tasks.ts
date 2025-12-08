import { getMovie } from './controls/get-movie.js'
import { getTmdbImage, getTmdbPosterFromPath } from './controls/images.js'
import { addMovie } from './controls/add-movie.js'

async function main() {
    // const movie = await getMovie({
    //     name: 'X-Men: First Class',
    //     getLetterboxd: false,
    // })
    await addMovie('X-Men: First Class')
}

main()
