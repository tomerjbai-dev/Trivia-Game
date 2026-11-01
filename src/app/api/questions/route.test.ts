import {
  APIConnectionError,
  APIConnectionTimeoutError,
  InternalServerError,
  RateLimitError,
} from "openai";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateQuestion = vi.fn();
vi.mock("@/server/ai/questionGenerator", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/ai/questionGenerator")>()),
  generateQuestion: (...args: unknown[]) => generateQuestion(...args),
}));

const isFlagged = vi.fn();
vi.mock("@/server/ai/moderation", () => ({
  isFlagged: (...args: unknown[]) => isFlagged(...args),
}));

import { MissingApiKeyError } from "@/server/ai/questionGenerator";
import { POST } from "./route";

const question = {
  question: "מה אוכלות פרות?",
  options: ["עשב", "דגים", "אבנים", "שוקולד"],
  correctIndex: 0,
};

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

let warn: ReturnType<typeof vi.spyOn>;

describe("POST /api/questions", () => {
  beforeEach(() => {
    generateQuestion.mockReset();
    isFlagged.mockReset();
    isFlagged.mockResolvedValue(false);
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
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
    ["a topic over 100 characters", { topic: "א".repeat(101) }],
    ["more than 10 recent questions", { topic: "חלל", recentQuestions: Array(11).fill("ש?") }],
    ["a body over 8KB", { topic: "חלל", padding: "x".repeat(9000) }],
  ])("returns 400 INVALID_TOPIC for %s", async (_, body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "INVALID_TOPIC" });
    expect(generateQuestion).not.toHaveBeenCalled();
    expect(isFlagged).not.toHaveBeenCalled();
  });

  it("returns 400 INVALID_TOPIC when the content type is not JSON", async () => {
    const response = await post({ topic: "חלל" }, { "Content-Type": "text/plain" });
    expect(response.status).toBe(400);
    expect(generateQuestion).not.toHaveBeenCalled();
  });

  it("returns 400 INVALID_TOPIC when Content-Length claims more than 8KB", async () => {
    const response = await post({ topic: "חלל" }, { "Content-Length": "9000" });
    expect(response.status).toBe(400);
    expect(generateQuestion).not.toHaveBeenCalled();
  });

  it("checks the topic in parallel with generation", async () => {
    let resolveGeneration: (value: unknown) => void = () => {};
    generateQuestion.mockReturnValue(new Promise((done) => (resolveGeneration = done)));

    const pending = post({ topic: "פרות" });
    await vi.waitFor(() => expect(isFlagged).toHaveBeenCalledWith("פרות"));
    expect(generateQuestion).toHaveBeenCalled();

    resolveGeneration(question);
    expect((await pending).status).toBe(200);
  });

  it("returns 422 UNSAFE_TOPIC for a flagged topic and drops the generated question", async () => {
    generateQuestion.mockResolvedValue(question);
    isFlagged.mockImplementation(async (text: string) => text === "נושא רע");

    const response = await post({ topic: "נושא רע" });

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ code: "UNSAFE_TOPIC" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("moderates the generated question and answers before returning them", async () => {
    generateQuestion.mockResolvedValue(question);
    await post({ topic: "פרות" });
    expect(isFlagged).toHaveBeenLastCalledWith([question.question, ...question.options].join("\n"));
  });

  it("returns 502 GENERATION_FAILED when the generated content is flagged", async () => {
    generateQuestion.mockResolvedValue(question);
    isFlagged.mockImplementation(async (text: string) => text !== "פרות");

    const response = await post({ topic: "פרות" });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "GENERATION_FAILED" });
  });

  it.each([
    ["the topic check", (text: string) => text === "פרות"],
    ["the output check", (text: string) => text !== "פרות"],
  ])("never returns a question when %s fails", async (_, failsFor) => {
    generateQuestion.mockResolvedValue(question);
    isFlagged.mockImplementation(async (text: string) => {
      if (failsFor(text)) throw new APIConnectionError({ message: "down" });
      return false;
    });

    const response = await post({ topic: "פרות" });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: "SERVICE_UNAVAILABLE" });
  });

  it.each([
    ["duplicate options", { ...question, options: ["עשב", "דגים", "עשב ", "שוקולד"] }],
    ["an empty option", { ...question, options: ["עשב", "  ", "אבנים", "שוקולד"] }],
    ["an empty question", { ...question, question: "   " }],
    ["correctIndex out of range", { ...question, correctIndex: 4 }],
  ])("returns 502 GENERATION_FAILED for %s", async (_, generated) => {
    generateQuestion.mockResolvedValue(generated);
    const response = await post({ topic: "פרות" });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "GENERATION_FAILED" });
  });

  it("returns 504 GENERATION_TIMEOUT when OpenAI times out", async () => {
    generateQuestion.mockRejectedValue(new APIConnectionTimeoutError());
    const response = await post({ topic: "פרות" });
    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ code: "GENERATION_TIMEOUT" });
  });

  it.each([
    ["a connection error", new APIConnectionError({ message: "secret" })],
    ["a server error", new InternalServerError(500, undefined, "secret", new Headers())],
  ])("returns 503 SERVICE_UNAVAILABLE for %s", async (_, error) => {
    generateQuestion.mockRejectedValue(error);
    const response = await post({ topic: "פרות" });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: "SERVICE_UNAVAILABLE" });
  });

  it("never logs the topic or the AI content", async () => {
    generateQuestion.mockResolvedValue(question);
    isFlagged.mockResolvedValue(true);
    await post({ topic: "נושא סודי" });

    const logged = warn.mock.calls.flat().join(" ");
    expect(logged).toContain("UNSAFE_TOPIC");
    expect(logged).not.toContain("נושא סודי");
    expect(logged).not.toContain(question.question);
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
