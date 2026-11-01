import {
  APIConnectionError,
  APIConnectionTimeoutError,
  InternalServerError,
  RateLimitError,
} from "openai";
import {
  MAX_BODY_BYTES,
  QuestionRequestSchema,
  ValidQuestionSchema,
  type ErrorCode,
  type QuestionRequest,
  type QuestionResponse,
} from "@/lib/questions/schema";
import { shuffleOptions } from "@/lib/questions/shuffle";
import { isFlagged } from "@/server/ai/moderation";
import { MissingApiKeyError, generateQuestion } from "@/server/ai/questionGenerator";

export const runtime = "nodejs";
export const maxDuration = 60;

const NO_STORE = { "Cache-Control": "no-store" };

type Stage = "input" | "topic-moderation" | "generation" | "validation" | "output-moderation";

function mapAiError(error: unknown): [ErrorCode, number] {
  // Timeout first: APIConnectionTimeoutError is a subclass of APIConnectionError.
  if (error instanceof APIConnectionTimeoutError) return ["GENERATION_TIMEOUT", 504];
  if (error instanceof RateLimitError) return ["TEMPORARILY_BUSY", 429];
  if (
    error instanceof MissingApiKeyError ||
    error instanceof APIConnectionError ||
    error instanceof InternalServerError
  ) {
    return ["SERVICE_UNAVAILABLE", 503];
  }
  return ["GENERATION_FAILED", 502];
}

async function readRequest(request: Request): Promise<QuestionRequest | null> {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) return null;

  const declaredLength = Number(request.headers.get("Content-Length"));
  if (declaredLength > MAX_BODY_BYTES) return null;

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return null;

  try {
    const parsed = QuestionRequestSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  // Log only the error code, stage and timing, never the topic or AI content.
  function fail(code: ErrorCode, status: number, stage: Stage) {
    console.warn(`[questions] ${code} ${stage} (${Date.now() - startedAt}ms)`);
    return Response.json({ code }, { status, headers: NO_STORE });
  }

  function failWith(error: unknown, stage: Stage) {
    const [code, status] = mapAiError(error);
    return fail(code, status, stage);
  }

  const input = await readRequest(request);
  if (!input) return fail("INVALID_TOPIC", 400, "input");

  // Topic check runs in parallel with generation to keep the wait short (ARCHITECTURE 2.5).
  const [topicCheck, generation] = await Promise.allSettled([
    isFlagged(input.topic),
    generateQuestion(input),
  ]);

  if (topicCheck.status === "rejected") return failWith(topicCheck.reason, "topic-moderation");
  if (topicCheck.value) return fail("UNSAFE_TOPIC", 422, "topic-moderation");
  if (generation.status === "rejected") return failWith(generation.reason, "generation");

  const generated = ValidQuestionSchema.safeParse(generation.value);
  if (!generated.success) return fail("GENERATION_FAILED", 502, "validation");

  const { question, options } = generated.data;
  try {
    if (await isFlagged([question, ...options].join("\n"))) {
      return fail("GENERATION_FAILED", 502, "output-moderation");
    }
  } catch (error) {
    return failWith(error, "output-moderation");
  }

  const result: QuestionResponse = { ...shuffleOptions(generated.data), topic: input.topic };
  return Response.json(result, { headers: NO_STORE });
}
