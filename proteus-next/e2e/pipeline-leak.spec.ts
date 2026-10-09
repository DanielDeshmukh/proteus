import { test, expect } from "@playwright/test";

const BOT_EMAIL = process.env.TEST_BOT_EMAIL || "";
const BOT_PASSWORD = process.env.TEST_BOT_PASSWORD || "";
const hasBotCreds = !!BOT_EMAIL && !!BOT_PASSWORD;
const hasLLMKeys = !!(process.env.GROQ_API_KEY && process.env.GEMINI_API_KEY);

const LEAK_JD = `Frontend Developer

We are looking for a Frontend Developer to join our team.

Requirements:
- 2+ years of experience with React
- Knowledge of HTML, CSS, and JavaScript
- Familiarity with REST APIs
- Good communication skills

Benefits:
- Remote work
- Health insurance
- Paid time off

Location: Remote
Type: Full-time
Salary: $80,000 - $100,000
`;

const LEAK_RESUME = `John Smith
john.smith@email.com | (555) 123-4567 | San Francisco, CA

Experience

Software Engineer at TechCorp (2022 - Present)
- Built React components for the main dashboard
- Worked on backend APIs using Node.js
- Fixed bugs and improved performance
- Collaborated with team members

Junior Developer at StartupXYZ (2020 - 2021)
- Developed web applications using JavaScript
- Helped with database management
- Participated in code reviews

Education

BS Computer Science, State University (2020)

Skills
JavaScript, React, Node.js, HTML, CSS, Git
`;

test.describe("Pipeline leak prevention (live LLM)", () => {
  test.skip(!hasBotCreds || !hasLLMKeys, "requires TEST_BOT_* and GROQ/GEMINI API keys");

  test("cover letter contains no placeholders, garble, or wrong names after a live run", async ({ page, request }) => {
    test.setTimeout(300_000);

    const reg = await request.post("/api/auth/register", {
      data: { name: "PROTEUS E2E Bot", email: BOT_EMAIL, password: BOT_PASSWORD },
    });
    expect(reg.ok() || reg.status() === 409).toBeTruthy();

    await page.goto("/signin");
    await page.getByLabel("Email address").fill(BOT_EMAIL);
    await page.getByRole("textbox", { name: "Password" }).fill(BOT_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/analyze", { timeout: 30000 });

    await page.goto("/analyze");
    await page.getByPlaceholder("Paste the job description...").fill(LEAK_JD);
    await page.getByPlaceholder("Paste your resume...").fill(LEAK_RESUME);
    await page.getByRole("button", { name: "Run Proteus pipeline" }).click();

    try {
      await expect(page.getByText("Analysis Complete")).toBeVisible({ timeout: 240_000 });
    } catch (err) {
      const limited = await page
        .getByText(/limit reached|daily limit/i)
        .first()
        .textContent()
        .catch(() => null);
      if (limited) test.skip(true, `rate limited: ${limited.trim()}`);
      throw err;
    }

    const letter = page.locator("pre").last();
    await expect(letter).toBeVisible({ timeout: 10000 });
    const letterText = (await letter.textContent()) ?? "";

    expect(letterText).not.toMatch(/\[[^\]\n]{1,60}\]/);
    expect(letterText).not.toContain("\uFFFD");
    expect(letterText).not.toMatch(/[\u00C2\u00C3][\u0080-\u00BF]/);
    expect(letterText).toContain("John Smith");

    const results = page.locator("section:has-text('Analysis Complete')");
    const resultsText = (await results.textContent()) ?? "";
    expect(resultsText).not.toContain("\uFFFD");
    expect(resultsText).not.toMatch(/\[(?!guard:)[A-Za-z][^\]\n]{0,58}\]/);

    const banner = page.getByTestId("guard-warnings");
    if (await banner.isVisible()) {
      await expect(banner).toContainText("hallucination guards");
    }
  });
});
