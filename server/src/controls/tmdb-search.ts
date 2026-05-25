import 'dotenv/config'
import { TMDB } from 'tmdb-ts'

export interface TMDBSearchReturn {
    id: number
    title: string
    overview: string
    releaseDate: string
    originalLanguage: string
    posterPath: string
}

export async function tmdbSearch(string: string): Promise<TMDBSearchReturn[]> {
    const tmdb = new TMDB(process.env.TMDB_API_KEY!)
    const res = await tmdb.search.movies({ query: string })

    return res.results.map((r) => ({
        id: r.id,
        title: r.title,
        overview: r.overview,
        releaseDate: r.release_date,
        originalLanguage: r.original_language,
        posterPath: r.poster_path,
    }))
}
