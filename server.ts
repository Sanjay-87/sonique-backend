import dotenv from 'dotenv';
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import spotifyLogin from './api/auth/spotifyLogin';
// import fs from 'fs';

dotenv.config({ path: '.env.local' });

const PORT = parseInt(process.env.PORT || "4000");

// Create Fastify instance
const fastify: FastifyInstance = Fastify({
  logger: true,
});

// const fastify: FastifyInstance = Fastify({
//   https: {
//     key: fs.readFileSync('./cert/key.pem'),
//     cert: fs.readFileSync('./cert/cert.pem'),
//   }
// });

// Register CORS
fastify.register(fastifyCors, {
  origin: true,
  credentials: true,
});

fastify.register(spotifyLogin, { prefix: '/api/auth' });

// Health Check Route
fastify.get('/api/health', async (request: FastifyRequest, reply: FastifyReply) => {
  return { message: "Sonique backend running perfectly with Fastify 🚀" };
});

// Start Server
const start = async () => {
  try {;
    await fastify.listen({
        port: PORT,
        host: '0.0.0.0',
    });
    console.log(`Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();


