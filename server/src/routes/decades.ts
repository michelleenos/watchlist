import { FastifyInstance } from 'fastify'
import { getDecades } from '../repositories/decades.js'

export async function decadesRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (_request, reply) => {
        const decades = await getDecades()
        reply.send(decades)
    })
}
