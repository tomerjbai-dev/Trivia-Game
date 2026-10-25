import type { ErrorCode, QuestionRequest, QuestionResponse } from "./schema";

export type FetchQuestionResult =
  | { ok: true; question: QuestionResponse }
  | { ok: false; code: ErrorCode };

export async function fetchQuestion(request: QuestionRequest): Promise<FetchQuestionResult> {
  let response: Response;
  try {
    response = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    return { ok: false, code: "NETWORK_ERROR" };
  }

  try {
    const data = await response.json();
    if (response.ok) {
      return { ok: true, question: data as QuestionResponse };
    }
    return { ok: false, code: (data?.code as ErrorCode) ?? "GENERATION_FAILED" };
  } catch {
    return { ok: false, code: "GENERATION_FAILED" };
  }
}
