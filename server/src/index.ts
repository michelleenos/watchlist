import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'
import path from 'path'
import { moviesRoutes } from './routes/movies.js'
import { tmdbRoutes } from './routes/tmdb.js'

const fastify = Fastify({ logger: true })

fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), './public'),
    prefix: '/',
})

fastify.register(moviesRoutes, { prefix: '/movies' })
fastify.register(tmdbRoutes, { prefix: '/tmdb' })

fastify.listen({ port: 3000 }, function (err) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})
