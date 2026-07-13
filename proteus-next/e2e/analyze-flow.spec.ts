import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads and shows hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PROTEUS/i);
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    const docsLink = page.locator('a[href="/docs"]').first();
    if (await docsLink.isVisible()) {
      await docsLink.click();
      await expect(page).toHaveURL(/docs/);
    }
  });
});

test.describe("Signin Page", () => {
  test("renders auth options", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.locator("text=Welcome to PROTEUS").first()).toBeVisible();
    await expect(page.locator("text=Continue with Google").first()).toBeVisible();
    await expect(page.locator("text=Continue with GitHub").first()).toBeVisible();
  });
});

test.describe("Docs Page", () => {
  test("loads documentation", async ({ page }) => {
    await page.goto("/docs", { timeout: 60000 });
    await expect(page.locator("text=PROTEUS User Guide").first()).toBeVisible();
  });

  test("has sidebar navigation", async ({ page }) => {
    await page.goto("/docs", { timeout: 60000 });
    await expect(page.locator("text=Introduction").first()).toBeVisible();
    await expect(page.locator("text=Getting Started").first()).toBeVisible();
  });
});

test.describe("Analyze Page — Auth Required", () => {
  test("redirects unauthenticated users to signin", async ({ page }) => {
    await page.goto("/analyze");
    await expect(page).toHaveURL(/signin/);
  });
});

test.describe("Health API", () => {
  test("returns ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe("ok");
  });
});

test.describe("Mobile Responsive", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("landing page loads on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PROTEUS/i);
  });

  test("docs page loads on mobile", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.locator("text=PROTEUS User Guide").first()).toBeVisible();
  });
});
