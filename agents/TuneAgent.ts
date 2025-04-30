// Names the playlist & sets tone

import { openai } from "../config/openai";

export const handleTuneAgent = async (context: {
    mood: string;
    genre: string;
    theme?: string;
}) => {
    const prompt = `Create a playlist title and description for a ${context.mood} ${context.genre} vibe.`;

    const response = await openai.chat.completions.create({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [{ role: "user", content: prompt }],
    });

    return {
        title: response.choices[0].message.content?.split('\n')[0],
        description: response.choices[0].message.content,
    };
};
