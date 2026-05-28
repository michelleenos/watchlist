import axios, { AxiosError } from 'axios'
import * as cheerio from 'cheerio'
import type { MovieErrorType, MovieTypeLetterboxd } from './types-with-letterboxd.js'
import { toFilename } from '../utils.js'

export const letterboxdScrape = async (
    name: string,
    url?: string,
): Promise<MovieTypeLetterboxd | MovieErrorType> => {
    const urlName = toFilename(name)

    if (!url) {
        url = `https://letterboxd.com/film/${urlName}`
    }

    try {
        const res = await axios.get(url)

        if (res.status !== 200) {
            // throw new Error(`Non-200 response: ${res.status}`)
            return {
                name,
                errors: [`Issue fetching from letterboxd for ${url}: ${res.statusText}`],
            }
        }

        const $ = cheerio.load(res.data)

        const crewTab = $('#tab-crew')
        const directorEls = crewTab.find('a[href*="/director"]')
        const director = $(directorEls)
            .map((_, el) => $(el).text().trim())
            .toArray()
            .join(', ')

        const genreEls = $('#tab-genres a.text-slug')

        const genres: string[] = []
        const themes: string[] = []
        genreEls.each((_, el) => {
            const text = $(el).text().trim()
            if (text.toLowerCase().includes('show all')) return
            const href = $(el).attr('href') || ''
            if (href.includes('/films/theme') || href.includes('/films/mini-theme')) {
                themes.push(text)
            } else {
                genres.push(text)
            }
        })

        // const poster = $('.film-poster')

        console.log(`   🎊 Scraped Letterboxd for ${name}`)
        return {
            name,
            director,
            letterboxdGenres: genres,
            themes,
            letterboxdUrl: url,
            errors: [],
        }
    } catch (error) {
        if (error instanceof AxiosError) {
            return {
                name,
                errors: [`letterboxd not found ${url}: ${error.code} - ${error.message}`],
            }
        } else {
            return {
                name,
                errors: ['unexpected error'],
            }
        }
    }
}
