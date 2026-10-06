import Groq from 'groq-sdk';
import { getGroqApiKey, isGroqConfigured } from './config';

/**
 * Singleton Groq Client Instance
 * Strictly server-side only. Never exported to or instantiated in client components.
 */

let groqClientInstance: Groq | null = null;

export function getGroqClient(): Groq {
  if (!isGroqConfigured()) {
    throw new Error(
      'Alpha AI Copilot: GROQ_API_KEY is not configured in the server environment. Please set GROQ_API_KEY in .env.'
    );
  }

  if (!groqClientInstance) {
    groqClientInstance = new Groq({
      apiKey: getGroqApiKey(),
    });
  }

  return groqClientInstance;
}
