import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const parse = vi.fn();
vi.mock("openai", () => ({
  default: vi.fn(function () {
    return { responses: { parse } };
  }),
}));

import { GenerationError, MissingApiKeyError, generateQuestion } from "./questionGenerator";

const question = {
  question: "מה אוכלות פרות?",
  options: ["עשב", "דגים", "אבנים", "שוקולד"],
  correctIndex: 0,
};

describe("generateQuestion", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_MODEL", "gpt-5");
    parse.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("calls the Responses API with the app settings", async () => {
    parse.mockResolvedValue({ output_parsed: question });

    const result = await generateQuestion({ topic: "פרות", recentQuestions: ["שאלה קודמת?"] });

    expect(result).toEqual(question);
    const params = parse.mock.calls[0][0];
    expect(params.model).toBe("gpt-5");
    expect(params.reasoning).toEqual({ effort: "low" });
    expect(params.store).toBe(false);
    expect(params.text.verbosity).toBe("low");
    expect(params).not.toHaveProperty("temperature");
    // Topic and recent questions are passed as data, not inside the instructions.
    expect(JSON.parse(params.input)).toEqual({ topic: "פרות", recentQuestions: ["שאלה קודמת?"] });
    expect(params.instructions).not.toContain("פרות");
  });

  it("uses the model from OPENAI_MODEL", async () => {
    vi.stubEnv("OPENAI_MODEL", "other-model");
    parse.mockResolvedValue({ output_parsed: question });
    await generateQuestion({ topic: "פרות", recentQuestions: [] });
    expect(parse.mock.calls[0][0].model).toBe("other-model");
  });

  it("throws when the API key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(generateQuestion({ topic: "פרות", recentQuestions: [] })).rejects.toBeInstanceOf(
      MissingApiKeyError,
    );
    expect(parse).not.toHaveBeenCalled();
  });

  it("throws when the AI returns no parsed question", async () => {
    parse.mockResolvedValue({ output_parsed: null });
    await expect(generateQuestion({ topic: "פרות", recentQuestions: [] })).rejects.toBeInstanceOf(
      GenerationError,
    );
  });
});
