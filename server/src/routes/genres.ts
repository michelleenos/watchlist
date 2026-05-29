import { FastifyInstance } from 'fastify';
import { getGenres } from '../repositories/genres.js';

export async function genresRoutes(fastify: FastifyInstance) {
	fastify.get('/', async(_request, reply) => {
		const genres = await getGenres()
		reply.send(genres)
	})
}