import Fastify from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { deleteMovie } from '../controls/delete-movie.js'
import { tmdbSearch } from '../controls/tmdb-search.js'
import { addMovie, addMovieFromTmdb } from '../controls/add-movie.js'

const fastify = Fastify({ logger: true })

fastify.get('/', function (_request, reply) {
    reply.send({ hello: 'world' })
})

const deleteQuery = {
    type: 'object',
    properties: {
        id: { type: 'string' },
    },
    required: ['id'],
} as const

fastify.route<{ Querystring: FromSchema<typeof deleteQuery> }>({
    method: 'DELETE',
    url: '/movie',
    schema: {
        querystring: deleteQuery,
    },
    handler: async function (request, reply) {
        const id = request.query.id
        const result = await deleteMovie(id)
        reply.send(result)
    },
})

const tmdbSearchQuery = {
    type: 'object',
    properties: {
        name: { type: 'string' },
    },
    required: ['name'],
} as const

fastify.route<{ Querystring: FromSchema<typeof tmdbSearchQuery> }>({
    method: 'GET',
    url: '/search-tmdb',
    schema: {
        querystring: tmdbSearchQuery,
    },
    handler: async function (request, reply) {
        const name = request.query.name
        const results = await tmdbSearch(name)
        reply.send(results)
    },
})

fastify.listen({ port: 3000 }, function (err) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

const addMovieBody = {
    type: 'object',
    properties: {
        tmdbId: { type: 'number' },
    },
    required: ['tmdbId'],
} as const

fastify.route<{ Body: FromSchema<typeof addMovieBody> }>({
    method: 'POST',
    url: '/movie',
    schema: {
        body: addMovieBody,
    },
    handler: async function (request, reply) {
        const tmdbId = request.body.tmdbId
        const res = await addMovieFromTmdb(tmdbId)
        reply.send(res)
    },
})
