import { expect, test } from "@playwright/test";
import { QUESTIONS, askQuestion, mockQuestions } from "./helpers";

test("ask, answer correctly, ask again, answer wrongly", async ({ page }) => {
  const requests = await mockQuestions(page, QUESTIONS);
  await page.goto("/trivia");

  const newQuestion = page.getByRole("button", { name: "שאלה חדשה" }).first();
  await expect(newQuestion).toBeDisabled();

  await askQuestion(page, "חלל");
  await expect(page.getByRole("heading", { name: QUESTIONS[0].question })).toBeVisible();
  const answers = page.getByRole("group", { name: QUESTIONS[0].question }).getByRole("button");
  await expect(answers).toHaveCount(4);

  await answers.filter({ hasText: "כוכב חמה" }).click();
  await expect(page.getByText("כל הכבוד! תשובה נכונה")).toBeVisible();
  for (const answer of await answers.all()) await expect(answer).toBeDisabled();

  // The second "שאלה חדשה" under the feedback does the same thing
  await page.getByRole("button", { name: "שאלה חדשה" }).last().click();
  await expect(page.getByRole("heading", { name: QUESTIONS[1].question })).toBeVisible();
  expect(requests.map((r) => r.topic)).toEqual(["חלל", "חלל"]);

  await page.getByRole("button", { name: "שש" }).click();
  await expect(page.getByText("לא נורא! התשובה הנכונה מסומנת בירוק")).toBeVisible();
  await expect(page.getByRole("button", { name: /שמונה.*תשובה נכונה/ })).toBeVisible();
});

test("Enter in the topic box asks a question, and state survives navigation", async ({ page }) => {
  await mockQuestions(page, QUESTIONS);
  await page.goto("/trivia");

  const topic = page.getByLabel("איזה נושא מעניין אתכם?");
  await topic.fill("חלל");
  await topic.press("Enter");
  await expect(page.getByRole("heading", { name: QUESTIONS[0].question })).toBeVisible();
  await page.getByRole("button", { name: "נוגה" }).click();

  const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
  await nav.getByRole("link", { name: "אודות" }).click();
  await nav.getByRole("link", { name: "טריוויה" }).click();

  await expect(topic).toHaveValue("חלל");
  await expect(page.getByRole("heading", { name: QUESTIONS[0].question })).toBeVisible();
  await expect(page.getByText("לא נורא! התשובה הנכונה מסומנת בירוק")).toBeVisible();
});
