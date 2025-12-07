#!/usr/bin/env ts-node

import axios from 'axios'
import fs from 'fs'
import type { MovieTypeTMDB } from '../movie-type'

const main = async () => {
    const data = await fs.promises.readFile('./data/movies-with-info-6.json', 'utf-8')
    const movies = JSON.parse(data)

    for (const movie of movies) {
        if (!movie.posterPath) {
            continue
        }

        const extension = movie.posterPath.split('.').pop()
        // let url = `https://image.tmdb.org/t/p/w500/${movie.posterPath}`
        const filename = movie.name
            .replace(/[^\w\s-]|_/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase()
        movie.poster = `images/${filename}.${extension}`
        // let file = fs.createWriteStream(`images/${filename}.${extension}`)
        // const response = await axios({
        //     url,
        //     method: 'GET',
        //     responseType: 'stream',
        // })
        // response.data.pipe(file)
    }
    // let posters = movies.reduce((acc: { path: string, name: string }[], movie: any) => {
    //     if (movie.posterPath) acc.push(movie.posterPath)
    //     return acc
    // }, [])

    await fs.promises.writeFile('./data/movies-with-info-6.json', JSON.stringify(movies, null, 2))
    // await fs.promises.writeFile('./movies-with-info-2.json', JSON.stringify(json, null, 2))
}

export const getTmdbImage = async (
    movie: MovieTypeTMDB,
    replace = false,
): Promise<{ error: string } | { path: string }> => {
    if (!movie.tmdbPosterPath) {
        return { error: 'No poster path' }
    }

    try {
        const extension = movie.tmdbPosterPath.split('.').pop()
        const url = `https://image.tmdb.org/t/p/w500/${movie.tmdbPosterPath}`
        const filename = movie.name
            .replace(/[^\w\s-]|_/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase()
        const localPath = `public/images/${filename}.${extension}`
        const frontendPath = `images/${filename}.${extension}`

        if (fs.existsSync(localPath) && !replace) {
            console.log('File exists, skipping:', localPath)
            return { path: frontendPath }
        }

        const file = fs.createWriteStream(localPath)
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        })
        response.data.pipe(file)
        console.log(`   🖼️ Downloaded poster for ${movie.name}`)
        return { path: frontendPath }
    } catch (e: unknown) {
        console.log('   🛑 Error fetching poster for', movie.name, e)
        return { error: 'error fetching poster' }
    }
}
