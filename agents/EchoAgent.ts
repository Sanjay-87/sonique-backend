// Handles raw user prompt input 

import { openai } from "../config/openai";

export const handleEchoAgent = async (context: { input: string }) => {
    const prompt = context.input;

    const response = await openai.chat.completions.create({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [
            {
                role: 'system',
                content: 'You are Echo, an assistant that helps users describe what type of playlist they want.'
            },
            {
                role: 'user',
                content: prompt,
            }
        ]
    })

    return {
        parsedPrompt: response.choices[0].message.content,
    }
}