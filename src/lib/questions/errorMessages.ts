import type { ErrorCode } from "./schema";

// UI texts per error code (DESIGN 1.4).
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNSAFE_TOPIC: "בואו נבחר נושא אחר 🙂 את הנושא הזה לא נוכל לשאול עליו.",
  INVALID_TOPIC: "כתבו נושא כדי שנוכל להכין שאלה.",
  GENERATION_FAILED: "אופס! לא הצלחנו להכין שאלה הפעם.",
  SERVICE_UNAVAILABLE: "אופס! לא הצלחנו להכין שאלה הפעם.",
  GENERATION_TIMEOUT: "השאלה התעכבה קצת יותר מדי.",
  CLIENT_TIMEOUT: "השאלה התעכבה קצת יותר מדי.",
  TEMPORARILY_BUSY: "יש עכשיו הרבה שאלות בדרך. נחכה רגע?",
  NETWORK_ERROR: "נראה שאין חיבור לאינטרנט. בדקו את החיבור.",
};

// Topic problems are fixed by choosing another topic, so retrying the same one won't help.
export function isTopicProblem(code: ErrorCode): boolean {
  return code === "UNSAFE_TOPIC" || code === "INVALID_TOPIC";
}

export function canRetry(code: ErrorCode): boolean {
  return !isTopicProblem(code);
}
