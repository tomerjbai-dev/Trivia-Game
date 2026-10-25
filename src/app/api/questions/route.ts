import { APIConnectionError, InternalServerError, RateLimitError } from "openai";
import {
  GeneratedQuestionSchema,
  QuestionRequestSchema,
  type ErrorCode,
  type QuestionResponse,
} from "@/lib/questions/schema";
import { shuffleOptions } from "@/lib/questions/shuffle";
import { MissingApiKeyError, generateQuestion } from "@/server/ai/questionGenerator";

export const runtime = "nodejs";
export const maxDuration = 60;

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(code: ErrorCode, status: number) {
  return Response.json({ code }, { status, headers: NO_STORE });
}

function mapAiError(error: unknown): [ErrorCode, number] {
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

export async function POST(request: Request) {
  const startedAt = Date.now();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_TOPIC", 400);
  }

  const parsedRequest = QuestionRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return errorResponse("INVALID_TOPIC", 400);
  }

  try {
    const generated = GeneratedQuestionSchema.safeParse(
      await generateQuestion(parsedRequest.data),
    );
    if (!generated.success) {
      console.warn(`[questions] GENERATION_FAILED invalid shape (${Date.now() - startedAt}ms)`);
      return errorResponse("GENERATION_FAILED", 502);
    }

    const result: QuestionResponse = {
      ...shuffleOptions(generated.data),
      topic: parsedRequest.data.topic,
    };
    return Response.json(result, { headers: NO_STORE });
  } catch (error) {
    // Log only the error code and timing, never the topic or AI content.
    const [code, status] = mapAiError(error);
    console.warn(`[questions] ${code} (${Date.now() - startedAt}ms)`);
    return errorResponse(code, status);
  }
}
