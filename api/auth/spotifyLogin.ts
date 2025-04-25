import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import axios from "axios";
import { supabase } from "../../config/supabaseClient";
import dotenv from "dotenv";
import { SPOTIFY_ENDPOINTS } from "../../constants/endpoints";

dotenv.config({ path: ".env.local" });

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;

export default fp(async (fastify: FastifyInstance) => {
    console.log("[Spotify Plugin] Registering /login + /callback routes");

    // 🔁 Step 1: Redirect to Spotify Login
    fastify.get("/api/auth/login", async (request, reply) => {
        const scopes = [
            "user-read-private",
            "user-read-email",
            "playlist-modify-public",
            "playlist-modify-private",
        ].join(" ");

        const authUrl =
            SPOTIFY_ENDPOINTS.AUTHORIZE +
            `?response_type=code` +
            `&client_id=${SPOTIFY_CLIENT_ID}` +
            `&scope=${encodeURIComponent(scopes)}` +
            `&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}`;

        console.log("[Spotify Login] Redirecting to:", authUrl);
        reply.redirect(authUrl);
    });

    // 🔁 Step 2: Spotify Callback with `code`
    fastify.get("/api/auth/callback", async (request, reply) => {
        const { code, error } = request.query as {
            code?: string;
            error?: string;
        };

        if (error || !code) {
            return reply
                .status(400)
                .send({ error: error || "Missing code from Spotify" });
        }

        try {
            const tokenRes = await axios.post(
                SPOTIFY_ENDPOINTS.FETCH_TOKEN,
                new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: SPOTIFY_REDIRECT_URI,
                }).toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization:
                            "Basic " +
                            Buffer.from(
                                `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                            ).toString("base64"),
                    },
                }
            );

            const { access_token, refresh_token } = tokenRes.data;

            const userRes = await axios.get(SPOTIFY_ENDPOINTS.FETCH_USER, {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            const { id: spotify_id, email } = userRes.data;

            const { error: dbError } = await supabase.from("Users").upsert(
                {
                    spotify_id,
                    email,
                    access_token,
                    refresh_token,
                },
                { onConflict: "spotify_id" }
            );

            if (dbError) throw dbError;

            return reply.send({
                success: true,
                spotify_id,
                email,
            });
        } catch (err) {
            console.error("[Spotify Callback Error]", err);
            return reply
                .status(500)
                .send({ error: "Spotify authentication failed" });
        }
    });
});
