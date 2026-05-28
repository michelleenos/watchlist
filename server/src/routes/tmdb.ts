import type { FastifyInstance } from 'fastify'
import { Static, Type } from 'typebox'
import { tmdbSearch } from '../external/tmdb.js'

const TmdbSearchQuery = Type.Object({
    name: Type.String(),
})

type TmdbSearchQueryType = Static<typeof TmdbSearchQuery>

export async function tmdbRoutes(fastify: FastifyInstance) {
    fastify.get<{ Querystring: TmdbSearchQueryType }>('/search', {
        schema: {
            querystring: TmdbSearchQuery,
        },
        handler: async (request, reply) => {
            const name = request.query.name
            const results = await tmdbSearch(name)
            reply.send(results)
        },
    })
}
