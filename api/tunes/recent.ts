import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { supabase } from "../../config/supabaseClient";

export default fp(async (fastify: FastifyInstance) => {
    fastify.get("/recent", async (request, reply) => {
        const { user_id } = request.query as { user_id: string };

        const { data, error } = await supabase
            .from("Playlists")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (error) {
            return reply.status(500).send({ error: 'Could not fetch recent playlists' });
        }

        return reply.send(data);
    });
});
