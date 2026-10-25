import { z } from "zod";

// Shared contract for POST /api/questions (ARCHITECTURE 2.4), used by server and client.

export const MAX_TOPIC_LENGTH = 100;
export const MAX_RECENT_QUESTIONS = 10;
export const MAX_RECENT_QUESTION_LENGTH = 200;

export const QuestionRequestSchema = z.object({
  topic: z.string().trim().min(1).max(MAX_TOPIC_LENGTH),
  recentQuestions: z
    .array(z.string().max(MAX_RECENT_QUESTION_LENGTH))
    .max(MAX_RECENT_QUESTIONS)
    .default([]),
});

export type QuestionRequest = z.infer<typeof QuestionRequestSchema>;

// Shape the AI must return (also sent to OpenAI as the Structured Output schema).
export const GeneratedQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export type QuestionResponse = GeneratedQuestion & { topic: string };

export type ErrorCode =
  | "INVALID_TOPIC"
  | "UNSAFE_TOPIC"
  | "GENERATION_FAILED"
  | "SERVICE_UNAVAILABLE"
  | "GENERATION_TIMEOUT"
  | "TEMPORARILY_BUSY"
  | "NETWORK_ERROR"
  | "CLIENT_TIMEOUT";

export type ErrorResponse = { code: ErrorCode };
