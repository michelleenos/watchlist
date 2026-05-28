import type { FastifyInstance } from 'fastify'
import { addMovieFromTmdb } from '../services/add-movie.js'
import { Type, Static } from 'typebox'
import { getMovies, deleteMovie } from '../repositories/movies.js'

const AddMovieBody = Type.Object({
    tmdbId: Type.Number(),
})
type AddMovieBodyType = Static<typeof AddMovieBody>

const DeleteMovieParams = Type.Object({
    id: Type.String(),
})
type DeleteMovieParamsType = Static<typeof DeleteMovieParams>

export async function moviesRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (_request, reply) => {
        const movies = await getMovies()
        reply.send(movies)
    })

    fastify.post<{ Body: AddMovieBodyType }>('/', {
        schema: { body: AddMovieBody },
        handler: async (request, reply) => {
            const movie = await addMovieFromTmdb(request.body.tmdbId)
            reply.send(movie)
        },
    })

    fastify.delete<{ Params: DeleteMovieParamsType }>('/:id', {
        schema: { params: DeleteMovieParams },
        handler: async function (request, reply) {
            const found = await deleteMovie(request.params.id)
            if (!found) {
                reply.code(404).send({ error: 'Movie not found' })
                return
            }
            reply.send({ success: true })
        },
    })
}
