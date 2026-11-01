import { expect, test, type Page } from "@playwright/test";
import { QUESTIONS, mockQuestions } from "./helpers";

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

// The element must sit fully inside the viewport width (not cut off at the sides).
async function expectInsideViewportWidth(page: Page, selector: ReturnType<Page["locator"]>) {
  const box = await selector.boundingBox();
  const width = page.viewportSize()!.width;
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(width + 0.5);
}

for (const path of ["/", "/trivia", "/about"]) {
  test(`no clipping or horizontal scroll on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expectNoHorizontalScroll(page);

    const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
    await expect(nav).toBeInViewport();
    for (const link of await nav.getByRole("link").all()) {
      await expectInsideViewportWidth(page, link);
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expectInsideViewportWidth(page, page.getByRole("heading", { level: 1 }));
  });
}

test("trivia screen with an answered question fits the screen", async ({ page }) => {
  await mockQuestions(page, [
    {
      question: "שאלה ארוכה במיוחד כדי לבדוק שהטקסט נשבר לשורות ולא נחתך בצד של המסך בטלפון קטן?",
      options: ["תשובה ארוכה מאוד שצריכה להישבר לשתי שורות לפחות", "ב", "ג", "ד"],
      correctIndex: 1,
    },
  ]);
  await page.goto("/trivia");
  await page.getByLabel("איזה נושא מעניין אתכם?").fill("בדיקה");
  await page.getByRole("button", { name: "שאלה חדשה" }).first().click();
  await page.getByRole("button", { name: /תשובה ארוכה/ }).click();

  await expectNoHorizontalScroll(page);
  for (const answer of await page.getByRole("group").getByRole("button").all()) {
    await expectInsideViewportWidth(page, answer);
    expect((await answer.boundingBox())!.height).toBeGreaterThanOrEqual(56);
  }
  await expectInsideViewportWidth(page, page.getByRole("button", { name: "שאלה חדשה" }).last());
});

test("the whole flow works with the keyboard only", async ({ page }) => {
  await mockQuestions(page, QUESTIONS);
  await page.goto("/trivia");

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("איזה נושא מעניין אתכם?")).toBeFocused();
  await page.keyboard.type("חלל");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: QUESTIONS[0].question })).toBeVisible();

  // Topic field -> "שאלה חדשה" -> first answer
  await page.getByLabel("איזה נושא מעניין אתכם?").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "שאלה חדשה" }).first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "נוגה" })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByText("כל הכבוד! תשובה נכונה")).toBeVisible();
});
