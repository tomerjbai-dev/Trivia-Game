import { describe, expect, it } from "vitest";
import { GeneratedQuestionSchema, QuestionRequestSchema } from "./schema";

const validQuestion = {
  question: "מה אוכלות פרות?",
  options: ["עשב", "דגים", "אבנים", "שוקולד"],
  correctIndex: 0,
};

describe("QuestionRequestSchema", () => {
  it("accepts a topic and trims it", () => {
    const result = QuestionRequestSchema.parse({ topic: "  חלל  " });
    expect(result).toEqual({ topic: "חלל", recentQuestions: [] });
  });

  it.each(["", "   ", "א".repeat(101)])("rejects invalid topic %#", (topic) => {
    expect(QuestionRequestSchema.safeParse({ topic }).success).toBe(false);
  });

  it("rejects more than 10 recent questions", () => {
    const recentQuestions = Array.from({ length: 11 }, (_, i) => `שאלה ${i}`);
    expect(QuestionRequestSchema.safeParse({ topic: "חלל", recentQuestions }).success).toBe(false);
  });

  it("rejects recent questions longer than 200 characters", () => {
    const recentQuestions = ["א".repeat(201)];
    expect(QuestionRequestSchema.safeParse({ topic: "חלל", recentQuestions }).success).toBe(false);
  });
});

describe("GeneratedQuestionSchema", () => {
  it("accepts a valid question", () => {
    expect(GeneratedQuestionSchema.safeParse(validQuestion).success).toBe(true);
  });

  it.each([
    ["three options", { ...validQuestion, options: ["א", "ב", "ג"] }],
    ["five options", { ...validQuestion, options: ["א", "ב", "ג", "ד", "ה"] }],
    ["an empty option", { ...validQuestion, options: ["א", "", "ג", "ד"] }],
    ["an empty question", { ...validQuestion, question: "" }],
    ["correctIndex 4", { ...validQuestion, correctIndex: 4 }],
    ["correctIndex -1", { ...validQuestion, correctIndex: -1 }],
    ["fractional correctIndex", { ...validQuestion, correctIndex: 1.5 }],
  ])("rejects %s", (_, value) => {
    expect(GeneratedQuestionSchema.safeParse(value).success).toBe(false);
  });
});
