import { test, expect } from "@playwright/test";

const BOT_EMAIL = process.env.TEST_BOT_EMAIL || "proteus-e2e-bot+fak3x9z@proteus-test.local";
const BOT_PASSWORD = process.env.TEST_BOT_PASSWORD || "T3st!Bot@Proteus2026";
const BOT_NAME = "PROTEUS E2E Bot";

test.describe.configure({ mode: "serial" });

test.describe("Bot Setup", () => {
  test("register test bot if not exists", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: { name: BOT_NAME, email: BOT_EMAIL, password: BOT_PASSWORD },
    });
    expect(res.ok() || res.status() === 409).toBeTruthy();
  });
});

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
  test("renders email+password form by default", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.locator("text=Welcome to PROTEUS").first()).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
  });

  test("has magic link toggle", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.locator("text=Sign in with magic link instead").first()).toBeVisible();
  });

  test("has Google and GitHub OAuth buttons", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.locator("text=Continue with Google").first()).toBeVisible();
    await expect(page.locator("text=Continue with GitHub").first()).toBeVisible();
  });

  test("has link to signup page", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.locator("text=Sign up").first()).toBeVisible();
  });
});

test.describe("Signup Page", () => {
  test("renders registration form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("text=Create your account").first()).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true }).first()).toBeVisible();
  });

  test("shows password strength indicator", async ({ page }) => {
    await page.goto("/signup");
    const pwInput = page.getByLabel("Password", { exact: true }).first();
    await pwInput.fill("weak");
    await expect(page.locator("text=Weak").first()).toBeVisible();
    await pwInput.fill("Str0ng!Pass");
    await expect(page.locator("text=Good").first()).toBeVisible();
  });

  test("validates password requirements", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByLabel("Password", { exact: true }).first().fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("text=at least 8 characters").first()).toBeVisible();
  });

  test("has link to signin page", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("text=Sign in").first()).toBeVisible();
  });
});

test.describe("Forgot Password Page", () => {
  test("renders forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("text=Forgot password?").first()).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
  });

  test("shows success message after submit", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.locator("text=Check your email").first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Analyze Page — Auth Required", () => {
  test("redirects unauthenticated users to signin", async ({ page }) => {
    await page.goto("/analyze");
    await expect(page).toHaveURL(/signin/);
  });
});

test.describe("Bot Sign-In Flow", () => {
  test("can sign in with bot credentials", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("Email address").fill(BOT_EMAIL);
    await page.getByRole("textbox", { name: "Password" }).fill(BOT_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/analyze", { timeout: 15000 });
    expect(page.url()).toContain("/analyze");
  });

  test("shows error for wrong password", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("Email address").fill(BOT_EMAIL);
    await page.getByRole("textbox", { name: "Password" }).fill("WrongPassword123!");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.locator("text=Invalid email or password").first()).toBeVisible({ timeout: 10000 });
  });

  test("can access analyze page after sign in", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("Email address").fill(BOT_EMAIL);
    await page.getByRole("textbox", { name: "Password" }).fill(BOT_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/analyze", { timeout: 15000 });
    await page.goto("/analyze");
    expect(page.url()).toContain("/analyze");
  });
});

test.describe("Password Visibility Toggle", () => {
  test("toggles password visibility on signin", async ({ page }) => {
    await page.goto("/signin");
    const pwInput = page.getByRole("textbox", { name: "Password" });
    await expect(pwInput).toHaveAttribute("type", "password");
    const toggleBtn = page.getByLabel("Show password");
    await toggleBtn.click();
    await expect(pwInput).toHaveAttribute("type", "text");
    const hideBtn = page.getByLabel("Hide password");
    await hideBtn.click();
    await expect(pwInput).toHaveAttribute("type", "password");
  });

  test("toggles password visibility on signup", async ({ page }) => {
    await page.goto("/signup");
    const pwInput = page.getByRole("textbox", { name: "Password" });
    await expect(pwInput).toHaveAttribute("type", "password");
    const toggleBtn = page.getByLabel("Show password").first();
    await toggleBtn.click();
    await expect(pwInput).toHaveAttribute("type", "text");
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

  test("signin page loads on mobile", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.locator("text=Welcome to PROTEUS").first()).toBeVisible();
  });

  test("docs page loads on mobile", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.locator("text=PROTEUS User Guide").first()).toBeVisible();
  });
});
