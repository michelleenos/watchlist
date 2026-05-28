import axios from 'axios'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import type { MovieTypeTMDB } from '../movie-type.js'
import { toFilename } from '../utils.js'

const IMAGES_DIR = path.resolve(process.cwd(), './public/images')

export const getTmdbImage = async (
    movie: MovieTypeTMDB,
    replace = false,
): Promise<{ error: string } | { path: string }> => {
    if (!movie.tmdbPosterPath) {
        return { error: 'No poster path' }
    }

    try {
        const url = `https://image.tmdb.org/t/p/w500/${movie.tmdbPosterPath}`
        const filename = toFilename(movie.name)
        const localPath = `${IMAGES_DIR}/${filename}.webp`
        const frontendPath = `images/${filename}.webp`

        if (fs.existsSync(localPath) && !replace) {
            console.log('File exists, skipping:', localPath)
            return { path: frontendPath }
        }

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
        })

        const imgData = await sharp(response.data)
            .resize({
                width: 400,
                withoutEnlargement: true,
            })
            .webp({ effort: 5, quality: 70 })
            .toBuffer()

        await fs.promises.writeFile(localPath, imgData)
        console.log(`   🖼️ Downloaded poster for ${movie.name}`)
        return { path: frontendPath }
    } catch (e: unknown) {
        console.log('   🛑 Error fetching poster for', movie.name, e)
        return { error: 'error fetching poster' }
    }
}
