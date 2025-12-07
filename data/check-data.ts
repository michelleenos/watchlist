import fs from 'fs/promises'
import { getDir } from './utils'
import type { MovieTypeFull } from './movie-type'

async function main() {
    const dir = getDir()

    const list = await fs.readFile(`${dir}/list.json`, 'utf-8')
    const listArray = JSON.parse(list) as string[]

    const data = await fs.readFile(`${dir}/movies-more.json`, 'utf-8')
    const movies = JSON.parse(data) as MovieTypeFull[]

    const missing: string[] = []
    listArray.forEach((movieName) => {
        const movie = movies.find(
            (m) => m.name.toLowerCase().trim() === movieName.toLowerCase().trim(),
        )
        if (!movie) {
            console.log(`❌ Missing movie: ${movieName}`)
            missing.push(movieName)
        }
    })

    if (missing.length) {
        console.log(`\nTotal missing movies: ${missing.length}`)
        await fs.writeFile(`${dir}/missing-movies.json`, JSON.stringify(missing, null, 2))
    }
}

main()
