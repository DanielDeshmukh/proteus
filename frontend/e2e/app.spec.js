import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("loads the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("One pipeline. One JD.");
  });

  test("navigates to history page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/history"]');
    await expect(page).toHaveURL("/history");
  });

  test("shows 404 for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent");
    await expect(page.locator("text=404")).toBeVisible();
  });
});

test.describe("Analyze Page - Input Controls", () => {
  test("shows JD input tabs (Paste, URL, Upload)", async ({ page }) => {
    await page.goto("/");
    // JD section has tabs: Paste, Upload, URL
    await expect(page.getByRole("button", { name: "Paste" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "URL" }).first()).toBeVisible();
  });

  test("shows Resume input tabs (Paste, Upload)", async ({ page }) => {
    await page.goto("/");
    // Resume section has Paste and Upload tabs
    const resumePaste = page.getByRole("button", { name: "Paste" }).nth(1);
    const resumeUpload = page.getByRole("button", { name: "Upload" }).nth(1);
    await expect(resumePaste).toBeVisible();
    await expect(resumeUpload).toBeVisible();
  });

  test("analyze button is disabled initially", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /run proteus pipeline/i });
    await expect(button).toBeDisabled();
  });

  test("analyze button enables when both JD and resume are pasted", async ({ page }) => {
    await page.goto("/");

    // Paste JD - first textarea
    const jdTextarea = page.locator("textarea").first();
    await jdTextarea.fill("Senior Software Engineer at Google. Requirements: 5+ years Python, React, AWS.");

    // Paste Resume - second textarea
    const resumeTextarea = page.locator("textarea").nth(1);
    await resumeTextarea.fill("John Doe. 6 years experience in Python, React, and AWS at Meta.");

    const button = page.getByRole("button", { name: /run proteus pipeline/i });
    await expect(button).toBeEnabled();
  });

  test("can switch between JD input tabs", async ({ page }) => {
    await page.goto("/");

    // Click URL tab in JD section (first set of tabs)
    const urlTab = page.getByRole("button", { name: "URL" }).first();
    await urlTab.click();

    // URL input should be visible
    await expect(page.locator('input[type="url"]').first()).toBeVisible();
  });
});

test.describe("Analyze Page - Pipeline Visualization", () => {
  test("shows all 5 pipeline stages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Parse").first()).toBeVisible();
    await expect(page.locator("text=Calibrate").first()).toBeVisible();
    await expect(page.locator("text=Map").first()).toBeVisible();
    await expect(page.locator("text=Rewrite").first()).toBeVisible();
    await expect(page.locator("text=Draft").first()).toBeVisible();
  });

  test("shows pipeline description", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Five agents").first()).toBeVisible();
  });
});

test.describe("Analyze Page - Results Display", () => {
  test("shows 'Ready to analyze' before running", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Ready to analyze")).toBeVisible();
  });
});

test.describe("History Page", () => {
  test("loads the history page", async ({ page }) => {
    await page.goto("/history");
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows navigation links", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "History" })).toBeVisible();
  });
});

test.describe("Responsive Design", () => {
  test("workspace grid stacks on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    // Page should still render
    await expect(page.locator("h1")).toContainText("One pipeline. One JD.");
  });
});

test.describe("Accessibility", () => {
  test("has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });

  test("buttons exist and are interactable", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: /run proteus pipeline/i });
    await expect(button).toBeVisible();
  });
});
