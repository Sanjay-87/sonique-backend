// Extracts mood, genre, energy from the prompt

import { openai } from "../config/openai";

export const handleIntentParserAgent = async (context: { parsedPrompt: string }) => {
    const response = await openai.chat.completions.create({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [
            {
                role: 'system',
                content: 'Extratc mood, genre, and energy (1-5) from the user request.'
            },
            {
                role: 'user',
                content: context.parsedPrompt
            }
        ]
    })

    return JSON.parse(response.choices[0].message.content || '{}')
}