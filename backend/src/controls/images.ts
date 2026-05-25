#!/usr/bin/env ts-node

import axios from 'axios'
import fs from 'fs'
import type { MovieTypeTMDB } from '../movie-type.js'
// import webp from 'webp-converter'
import { getDir } from '../utils.js'
import path from 'path'
import sharp from 'sharp'

export const getTmdbPosterFromPath = async (
    posterPath: string,
    movieName?: string,
    replace = false,
) => {
    try {
        const posterFile = posterPath.split('/').pop() || posterPath
        const splitFile = posterFile.split('.')
        // const extension = splitFile.pop()

        const url = `https://image.tmdb.org/t/p/w500/${posterPath}`
        const filename =
            movieName ?
                movieName
                    .replace(/[^\w\s-]|_/g, '')
                    .replace(/\s+/g, '-')
                    .toLowerCase()
            :   splitFile[0]

        const dir = getDir()
        const localPath = path.resolve(dir, `../../public/images/${filename}.webp`)
        const frontendPath = `images/${filename}.webp}`

        if (fs.existsSync(localPath) && !replace) {
            console.log('File exists, skipping:', localPath)
            return { path: frontendPath }
        }

        // const file = fs.createWriteStream(localPath)
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
        })

        const data = await sharp(response.data)
            .resize({
                width: 400,
                withoutEnlargement: true,
            })
            .webp({ effort: 5, quality: 70 })
            .toBuffer()

        await fs.promises.writeFile(localPath, data)
        console.log(`   🖼️ Downloaded poster ${posterPath}`)
    } catch (error) {
        console.log('   🛑 Error fetching poster ', posterPath, error)
        return { error: 'error fetching poster' }
    }
}

export const getTmdbImage = async (
    movie: MovieTypeTMDB,
    replace = false,
): Promise<{ error: string } | { path: string }> => {
    if (!movie.tmdbPosterPath) {
        return { error: 'No poster path' }
    }

    try {
        // const extension = movie.tmdbPosterPath.split('.').pop()
        const tmdbPosterPath = movie.tmdbPosterPath
        const posterFile = tmdbPosterPath.split('/').pop() || tmdbPosterPath
        const splitFile = posterFile.split('.')
        // const extension = splitFile.pop()

        const url = `https://image.tmdb.org/t/p/w500/${movie.tmdbPosterPath}`
        const filename = movie.name
            .replace(/[^\w\s-]|_/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase()
        const dir = getDir()
        const localPath = path.resolve(dir, `../../public/images/${filename}.webp`)
        const frontendPath = `images/${filename}.webp`

        if (fs.existsSync(localPath) && !replace) {
            console.log('File exists, skipping:', localPath)
            return { path: frontendPath }
        }

        // const file = fs.createWriteStream(localPath)
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

export const downloadImageToFile = async (url: string, localPath: string) => {
    const file = fs.createWriteStream(localPath)
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    })

    response.data.pipe(file)

    return localPath
}
