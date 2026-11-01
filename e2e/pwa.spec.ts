import { expect, test } from "@playwright/test";

// Installability doesn't depend on screen size, so this runs once.
test.skip(({ viewport }) => (viewport?.width ?? 0) < 1280, "desktop only");

test("manifest has the required fields and all its icons load", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();

  const response = await request.get(href!);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest).toMatchObject({
    name: "חכמולוגים",
    short_name: "חכמולוגים",
    lang: "he",
    dir: "rtl",
    display: "standalone",
    start_url: "/",
  });

  const purposes = manifest.icons.map((icon: { purpose: string }) => icon.purpose);
  expect(purposes).toContain("maskable");
  const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
  expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));

  for (const icon of manifest.icons as { src: string }[]) {
    const iconResponse = await request.get(icon.src);
    expect(iconResponse.ok(), icon.src).toBe(true);
    expect(iconResponse.headers()["content-type"]).toBe("image/png");
  }
});

test("iOS home-screen icon is linked, and no service worker is registered", async ({ page, request }) => {
  await page.goto("/");
  const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
  expect(appleIcon).toBeTruthy();
  expect((await request.get(appleIcon!)).ok()).toBe(true);

  const registrations = await page.evaluate(async () =>
    "serviceWorker" in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
  );
  expect(registrations).toBe(0);
});
