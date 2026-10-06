/**
 * Alpha AI Copilot - Core Configuration
 * Centralized configuration for the Groq AI service.
 * Never import this file in client-side code.
 */

export const AI_CONFIG = {
  // Configurable Groq model via env var (reads GROQ_MODEL from .env)
  model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  
  // Rate limiting & token limits
  maxInputTokens: 2048,
  maxOutputTokens: 1024,
  temperature: 0.3, // Low temperature for high factual accuracy in ERP operations
  topP: 0.9,
  
  // Guardrails
  maxMessageLength: 2000,
  maxHistoryMessages: 10,
  
  // Rate limits per user
  rateLimitWindowMs: 60 * 1000, // 1 minute
  rateLimitMaxRequests: 15,     // 15 requests per minute per user
} as const;

export function getGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return '';
  }
  return apiKey;
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey());
}
