import { GoogleGenAI, Chat } from "@google/genai";
import { MASTER_PROMPT } from '../constants';

/**
 * Creates a new Gemini chat instance.
 * @param apiKey The user's Google Gemini API key.
 * @returns A new Chat instance.
 */
export function createChatInstance(apiKey: string): Chat {
    const ai = new GoogleGenAI({ apiKey });
    return ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
            systemInstruction: MASTER_PROMPT,
        },
    });
}

/**
 * Sends a message to the chat instance and returns a stream of responses.
 * @param chatInstance The active chat instance.
 * @param newMessage The new message from the user.
 * @param fileContext The context from any uploaded files.
 * @returns An async generator that yields response text chunks.
 */
export async function streamChatResponse(
    chatInstance: Chat,
    newMessage: string,
    fileContext: string
): Promise<AsyncGenerator<string, void, unknown>> {
    const fullMessage = fileContext ? `${fileContext}\n\n---\n\n${newMessage}` : newMessage;

    // The chat instance maintains its own history, so we only need to send the latest message.
    const responseStream = await chatInstance.sendMessageStream({ message: fullMessage });

    async function* generator(): AsyncGenerator<string, void, unknown> {
        for await (const chunk of responseStream) {
            // Ensure we only yield the text part of the chunk.
            if (chunk && typeof chunk.text === 'string') {
                 yield chunk.text;
            }
        }
    }

    return generator();
}
