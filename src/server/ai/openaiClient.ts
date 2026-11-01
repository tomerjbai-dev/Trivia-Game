import OpenAI from "openai";

// Single place that reads the API key (server only).

export class MissingApiKeyError extends Error {}

export function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError("OPENAI_API_KEY is not set");
  }
  // No automatic SDK retries: each retry is billed and the child is waiting (ARCHITECTURE 2.9).
  return new OpenAI({ apiKey, maxRetries: 0 });
}
