// Checks that the configured model is available with this API key and supports
// Structured Outputs with the same settings the app uses. Never prints the key.
// Run: npm run check:ai  (loads .env.local via node --env-file)
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const model = process.env.OPENAI_MODEL || "gpt-5";

if (!process.env.OPENAI_API_KEY) {
  console.error("FAILED: OPENAI_API_KEY is empty in .env.local");
  process.exit(1);
}

const schema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
});

try {
  const client = new OpenAI();
  const response = await client.responses.parse({
    model,
    instructions: "כתבו שאלת טריוויה קצרה אחת בעברית לילדים, עם ארבע תשובות.",
    input: JSON.stringify({ topic: "חיות", recentQuestions: [] }),
    reasoning: { effort: "low" },
    text: { format: zodTextFormat(schema, "trivia_question"), verbosity: "low" },
    store: false,
  });
  if (!response.output_parsed) {
    console.error(`FAILED: ${model} returned no structured output`);
    process.exit(1);
  }
  console.log(`OK: ${response.model} supports Structured Outputs`);
} catch (error) {
  const status = error?.status ? ` (HTTP ${error.status})` : "";
  console.error(`FAILED: ${error?.constructor?.name ?? "Error"}${status}: ${error?.message ?? ""}`);
  process.exit(1);
}
