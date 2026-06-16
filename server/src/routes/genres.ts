import { FastifyInstance } from 'fastify'
import { getGenres } from '../repositories/genres.js'
import { Static, Type } from 'typebox'
import Value from 'typebox/value'

const GenresResponse = Type.Array(Type.String())

export async function genresRoutes(fastify: FastifyInstance) {
    fastify.get(
        '/',
        {
            schema: { response: { 200: GenresResponse } },
        },
        async (_request, reply) => {
            const genres = await getGenres()

            // this is probably overkill
            // if (!Value.Check(GenresResponse, genres)) {
            //     throw new Error('genres response failed validation')
            // }

            reply.send(genres)
        },
    )
}
