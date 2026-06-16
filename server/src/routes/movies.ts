import type { FastifyInstance } from 'fastify'
import { addMovieFromTmdb } from '../services/add-movie.js'
import { Type, Static } from 'typebox'
import { getMovies, deleteMovie, getMovie } from '../repositories/movies.js'

const AddMovieBody = Type.Object({
    tmdbId: Type.Number(),
})
type AddMovieBodyType = Static<typeof AddMovieBody>

const MovieIdParams = Type.Object({
    id: Type.String(),
})
type MovieIdParamsType = Static<typeof MovieIdParams>

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

    fastify.get<{ Params: MovieIdParamsType }>('/:id', {
        schema: { params: MovieIdParams },
        handler: async function (request, reply) {
            const movie = await getMovie(request.params.id)
            if (movie) {
                reply.send(movie)
            } else {
                reply.code(404)
            }
        },
    })

    fastify.delete<{ Params: MovieIdParamsType }>('/:id', {
        schema: { params: MovieIdParams },
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
