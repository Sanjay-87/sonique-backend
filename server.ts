import dotenv from 'dotenv';
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from 'fastify-cors';

dotenv.config();

// Create Fastify instance
const fastify: FastifyInstance = Fastify({
  logger: true,
});

// Register CORS
fastify.register(fastifyCors, {
  origin: true,
  credentials: true,
});

// Health Check Route
fastify.get('/api/health', async (request: FastifyRequest, reply: FastifyReply) => {
  return { message: "Sonique backend running perfectly with Fastify 🚀" };
});

// (Future: Register other routes)
// fastify.register(import('./api/auth/spotifyLogin'), { prefix: '/api/auth' });
// fastify.register(import('./api/tunes/generateTune'), { prefix: '/api/tunes' });

// Start Server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    await fastify.listen({
        port,
        host: '0.0.0.0',
    });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
