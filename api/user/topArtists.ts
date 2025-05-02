import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import axios from 'axios';

export default fp(async (fastify: FastifyInstance) => {
  fastify.get('/top-artists', async (request, reply) => {
    const { access_token } = request.query as { access_token?: string };

    if (!access_token) {
      return reply.status(400).send({ error: 'Missing access_token' });
    }

    try {
      const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          limit: 6,
          time_range: 'short_term', // or 'medium_term' | 'long_term'
        },
      });

      const artists = response.data.items.map((artist: any) => ({
        name: artist.name,
        image: artist.images?.[0]?.url || null,
        genres: artist.genres,
        spotify_url: artist.external_urls?.spotify || '',
      }));

      return reply.send({ top_artists: artists });
    } catch (err) {
      console.error('[Top Artists Error]', err);
      return reply.status(500).send({ error: 'Failed to fetch top artists' });
    }
  });
});
