
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { handleEchoAgent } from "../../agents/EchoAgent";
import { handleIntentParserAgent } from "../../agents/IntentParserAgent";
import { handleTuneAgent } from "../../agents/TuneAgent";
import { handlePlaylistAgent } from "../../agents/PlaylistAgent";

export default fp(async (fastify: FastifyInstance) => {
    fastify.post("/context", async (request, reply) => {
        const { agentId, context } = request.body as {
            agentId: string;
            context: any;
        };

        try {
            switch (agentId) {
                case "EchoAgent":
                    return reply.send(await handleEchoAgent(context));
                case "IntentParserAgent":
                    return reply.send(await handleIntentParserAgent(context));
                case "TuneAgent":
                    return reply.send(await handleTuneAgent(context));
                case "PlaylistAgent":
                    return reply.send(await handlePlaylistAgent(context));
                default:
                    return reply.status(400).send({ error: "Unknown agentId" });
            }
        } catch (error) {
            console.error("[MCP Error]", error);
            return reply.status(500).send({ error: "Agent failure" });
        }
    });
});
