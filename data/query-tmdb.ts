import 'dotenv/config'
import { TMDB } from 'tmdb-ts'
async function queryTmdb(string: string) {
    try {
        const tmdb = new TMDB(process.env.TMDB_API_KEY!)

        const results = await tmdb.search.movies({ query: string })
        console.log(
            results.results.map((r) => ({
                id: r.id,
                title: r.title,
                overview: r.overview,
                release_date: r.release_date,
                original_language: r.original_language,
            })),
        )
    } catch (e) {
        console.log('Error', e)
    }
}

queryTmdb(process.argv[2])
