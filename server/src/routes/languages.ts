import { FastifyInstance } from 'fastify'
import { getLanguages } from '../repositories/languages.js'

export async function languagesRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (_request, reply) => {
        const decades = await getLanguages()
        reply.send(decades)
    })
}
