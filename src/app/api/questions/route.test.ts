import { RateLimitError } from "openai";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateQuestion = vi.fn();
vi.mock("@/server/ai/questionGenerator", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/ai/questionGenerator")>()),
  generateQuestion: (...args: unknown[]) => generateQuestion(...args),
}));

import { MissingApiKeyError } from "@/server/ai/questionGenerator";
import { POST } from "./route";

const question = {
  question: "מה אוכלות פרות?",
  options: ["עשב", "דגים", "אבנים", "שוקולד"],
  correctIndex: 0,
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/questions", () => {
  beforeEach(() => {
    generateQuestion.mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("returns a shuffled question with no-store caching", async () => {
    generateQuestion.mockResolvedValue(question);

    const response = await post({ topic: " פרות ", recentQuestions: ["שאלה?"] });

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const data = await response.json();
    expect(data.topic).toBe("פרות");
    expect(data.question).toBe(question.question);
    expect([...data.options].sort()).toEqual([...question.options].sort());
    expect(data.options[data.correctIndex]).toBe("עשב");
    expect(generateQuestion).toHaveBeenCalledWith({ topic: "פרות", recentQuestions: ["שאלה?"] });
  });

  it.each([
    ["an empty topic", { topic: "   " }],
    ["a missing topic", {}],
    ["broken JSON", "{not json"],
  ])("returns 400 INVALID_TOPIC for %s", async (_, body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "INVALID_TOPIC" });
    expect(generateQuestion).not.toHaveBeenCalled();
  });

  it("returns 502 GENERATION_FAILED for an invalid AI shape", async () => {
    generateQuestion.mockResolvedValue({ ...question, options: ["א", "ב", "ג"] });
    const response = await post({ topic: "פרות" });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "GENERATION_FAILED" });
  });

  it("returns 429 TEMPORARILY_BUSY on rate limit", async () => {
    generateQuestion.mockRejectedValue(
      new RateLimitError(429, undefined, "secret SDK message", new Headers()),
    );
    const response = await post({ topic: "פרות" });
    expect(response.status).toBe(429);
    // Only the code is returned, never SDK details.
    expect(await response.json()).toEqual({ code: "TEMPORARILY_BUSY" });
  });

  it("returns 503 SERVICE_UNAVAILABLE when the API key is missing", async () => {
    generateQuestion.mockRejectedValue(new MissingApiKeyError("missing"));
    const response = await post({ topic: "פרות" });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: "SERVICE_UNAVAILABLE" });
  });

  it("returns 502 GENERATION_FAILED for unknown errors", async () => {
    generateQuestion.mockRejectedValue(new Error("boom"));
    const response = await post({ topic: "פרות" });
    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
