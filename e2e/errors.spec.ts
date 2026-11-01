import { expect, test } from "@playwright/test";
import { QUESTIONS, askQuestion, mockQuestions } from "./helpers";

test("an AI failure shows 'נסו שוב', which retries the same topic", async ({ page }) => {
  const requests = await mockQuestions(page, [
    { status: 502, code: "GENERATION_FAILED" },
    QUESTIONS[0],
  ]);
  await page.goto("/trivia");

  await askQuestion(page, "חלל");
  await expect(page.getByText("אופס! לא הצלחנו להכין שאלה הפעם.")).toBeVisible();

  await page.getByRole("button", { name: "נסו שוב" }).click();
  await expect(page.getByRole("heading", { name: QUESTIONS[0].question })).toBeVisible();
  expect(requests.map((r) => r.topic)).toEqual(["חלל", "חלל"]);
});

test("a blocked topic shows the friendly message and keeps the topic", async ({ page }) => {
  await mockQuestions(page, [{ status: 422, code: "UNSAFE_TOPIC" }]);
  await page.goto("/trivia");

  await askQuestion(page, "נושא כלשהו");
  await expect(page.getByText(/בואו נבחר נושא אחר/)).toBeVisible();
  await expect(page.getByRole("button", { name: "נסו שוב" })).toHaveCount(0);
  await expect(page.getByLabel("איזה נושא מעניין אתכם?")).toHaveValue("נושא כלשהו");
});

test("going offline shows the no-internet message and keeps the previous question", async ({
  page,
  context,
}) => {
  await mockQuestions(page, QUESTIONS);
  await page.goto("/trivia");
  await askQuestion(page, "חלל");
  await expect(page.getByRole("heading", { name: QUESTIONS[0].question })).toBeVisible();

  await context.setOffline(true);
  await page.getByRole("button", { name: "שאלה חדשה" }).first().click();
  await expect(page.getByText("נראה שאין חיבור לאינטרנט. בדקו את החיבור.")).toBeVisible();
  await expect(page.getByRole("heading", { name: QUESTIONS[0].question })).toBeVisible();
  await context.setOffline(false);
});
