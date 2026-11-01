import { createOpenAIClient } from "./openaiClient";

const MODERATION_MODEL = "omni-moderation-latest";

// Short timeout so the whole request (generation + output check) ends before the
// browser's 40 second timeout.
export const MODERATION_TIMEOUT_MS = 5_000;

// Returns true when the text is flagged. Errors are thrown, never treated as "safe".
export async function isFlagged(text: string): Promise<boolean> {
  const client = createOpenAIClient();
  const response = await client.moderations.create(
    { model: MODERATION_MODEL, input: text },
    { timeout: MODERATION_TIMEOUT_MS },
  );
  return response.results.some((result) => result.flagged);
}
