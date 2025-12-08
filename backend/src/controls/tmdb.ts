#!/usr/bin/env ts-node

import 'dotenv/config'
import { TMDB } from 'tmdb-ts'
import type { MovieErrorType, MovieTypeTMDB } from '../movie-type'

const tmdb = new TMDB(process.env.TMDB_API_KEY!)

async function findTmdbId(name: string): Promise<number | null> {
    const search = await tmdb.search.movies({ query: name })
    const id = search.results[0]?.id
    return id || null
}

export async function getTmdbData(
    nameOrId: string | number,
): Promise<MovieTypeTMDB | MovieErrorType> {
    let id: number
    if (typeof nameOrId === 'string') {
        const foundId = await findTmdbId(nameOrId)
        if (!foundId) {
            return {
                name: nameOrId,
                errors: ['Cannot find TMDB ID'],
            }
        }

        id = foundId
    } else {
        id = nameOrId
    }

    const details = await tmdb.movies.details(id)
    const credits = await tmdb.movies.credits(id)

    const cast: { name: string; role: string }[] = []
    const crew: { name: string; role: string }[] = []

    for (let i = 0; i < Math.min(credits.cast.length, 5); i++) {
        const member = credits.cast[i]
        cast.push({
            name: member.name,
            role: member.character,
        })
    }

    for (let i = 0; i < Math.min(credits.crew.length, 10); i++) {
        const member = credits.crew[i]
        crew.push({
            name: member.name,
            role: `${member.department} (${member.job})`,
        })
    }

    const year = parseInt(details.release_date.split('-')[0]) || undefined
    const originalTitle =
        details.original_title !== details.title ? details.original_title : undefined

    const movie: MovieTypeTMDB = {
        name: details.title,
        year,
        language: details.original_language,
        tmdbPopularity: details.popularity,
        tmdbVoteAverage: details.vote_average,
        tmdbVoteCount: details.vote_count,
        tmdbPosterPath: details.poster_path || undefined,
        tagline: details.tagline,
        tmdbGenres: details.genres.map((g) => g.name),
        tmdbOverview: details.overview,
        tmdbId: details.id,
        originalTitle,
        cast,
        crew,
        errors: [],
    }

    console.log('   🎊 Fetched TMDB data for', movie.name)

    return movie
}
