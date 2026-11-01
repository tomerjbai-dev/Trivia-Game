import type { Page, Route } from "@playwright/test";

// Test-only stand-in for the AI: intercepts /api/questions in the browser.
export type MockQuestion = { question: string; options: string[]; correctIndex: number };

export const QUESTIONS: MockQuestion[] = [
  {
    question: "איזה כוכב לכת הכי קרוב לשמש?",
    options: ["נוגה", "כוכב חמה", "מאדים", "צדק"],
    correctIndex: 1,
  },
  {
    question: "כמה רגליים יש לעכביש?",
    options: ["שש", "ארבע", "שמונה", "עשר"],
    correctIndex: 2,
  },
];

type MockReply = MockQuestion | { status: number; code: string };

// Replies in order; the last reply repeats once the list runs out.
export async function mockQuestions(page: Page, replies: MockReply[]) {
  const requests: { topic: string }[] = [];
  let call = 0;
  await page.route("**/api/questions", async (route: Route) => {
    const body = route.request().postDataJSON() as { topic: string };
    requests.push(body);
    const reply = replies[Math.min(call, replies.length - 1)];
    call += 1;
    if ("code" in reply) {
      await route.fulfill({ status: reply.status, json: { code: reply.code } });
    } else {
      await route.fulfill({ status: 200, json: { ...reply, topic: body.topic } });
    }
  });
  return requests;
}

export async function askQuestion(page: Page, topic: string) {
  await page.getByLabel("איזה נושא מעניין אתכם?").fill(topic);
  await page.getByRole("button", { name: "שאלה חדשה" }).first().click();
}
