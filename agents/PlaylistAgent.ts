// Selects song themes or search keywords

import { openai } from "../config/openai";

export const handlePlaylistAgent = async (context: {
    mood: string;
    genre: string;
    energy: number;
}) => {
    const prompt = `Give me a list of 10 song titles or keywords for a ${context.mood} ${context.genre} playlist with energy level ${context.energy}.`;

    const response = await openai.chat.completions.create({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [{ role: "user", content: prompt }],
    });

    return {
        keywords: response.choices[0].message.content
            ?.split("\n")
            .map((t) => t.trim())
            .filter(Boolean),
    };
};
