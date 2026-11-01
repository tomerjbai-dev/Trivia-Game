import { expect, test } from "@playwright/test";

test("home button opens trivia, and the bottom nav reaches all three screens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "חכמולוגים" })).toBeVisible();
  await expect(page.getByText("שאלות מעניינות על כל מה שמסקרן אתכם")).toBeVisible();

  await page.getByRole("link", { name: "בואו נשחק!" }).click();
  await expect(page).toHaveURL(/\/trivia$/);
  await expect(page.getByLabel("איזה נושא מעניין אתכם?")).toBeVisible();

  const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
  await nav.getByRole("link", { name: "אודות" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { name: "אודות" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "אודות" })).toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "בית" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(nav.getByRole("link", { name: "בית" })).toHaveAttribute("aria-current", "page");
});

test("exactly three nav destinations and no unapproved settings or results items", async ({ page }) => {
  await page.goto("/");
  const links = page.getByRole("navigation", { name: "ניווט ראשי" }).getByRole("link");
  await expect(links).toHaveText(["בית", "טריוויה", "אודות"]);
  await expect(page.getByText(/הגדרות|תוצאות/)).toHaveCount(0);
});
