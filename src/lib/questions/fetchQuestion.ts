import {
  QuestionResponseSchema,
  isErrorCode,
  type ErrorCode,
  type QuestionRequest,
  type QuestionResponse,
} from "./schema";

export const CLIENT_TIMEOUT_MS = 40_000;

export type FetchQuestionResult =
  | { ok: true; question: QuestionResponse }
  | { ok: false; code: ErrorCode };

// Used when the body has no known code (e.g. a hosting error page that isn't JSON).
function codeFromStatus(status: number): ErrorCode {
  if (status === 429) return "TEMPORARILY_BUSY";
  if (status === 503) return "SERVICE_UNAVAILABLE";
  if (status === 504) return "GENERATION_TIMEOUT";
  return "GENERATION_FAILED";
}

export async function fetchQuestion(request: QuestionRequest): Promise<FetchQuestionResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, code: "NETWORK_ERROR" };
  }

  let response: Response;
  try {
    response = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { ok: false, code: "CLIENT_TIMEOUT" };
    }
    return { ok: false, code: "NETWORK_ERROR" };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { ok: false, code: "CLIENT_TIMEOUT" };
    }
    return { ok: false, code: codeFromStatus(response.status) };
  }

  if (response.ok) {
    const parsed = QuestionResponseSchema.safeParse(data);
    return parsed.success
      ? { ok: true, question: parsed.data }
      : { ok: false, code: "GENERATION_FAILED" };
  }

  const code = (data as { code?: unknown } | null)?.code;
  return { ok: false, code: isErrorCode(code) ? code : codeFromStatus(response.status) };
}
