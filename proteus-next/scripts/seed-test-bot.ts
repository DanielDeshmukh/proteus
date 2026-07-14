/**
 * Seed script for Playwright E2E test bot user.
 * Run: npx tsx scripts/seed-test-bot.ts
 *
 * Creates a deterministic test user that only the test suite knows about.
 * The user is created via the /api/auth/register endpoint or directly in the DB.
 */

const TEST_BOT_EMAIL = process.env.TEST_BOT_EMAIL || "";
const TEST_BOT_PASSWORD = process.env.TEST_BOT_PASSWORD || "";
const TEST_BOT_NAME = "PROTEUS E2E Bot";

async function seedViaApi(baseUrl: string) {
  console.log(`[SEED] Registering test bot via API at ${baseUrl}`);

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: TEST_BOT_NAME,
      email: TEST_BOT_EMAIL,
      password: TEST_BOT_PASSWORD,
    }),
  });

  const data = await res.json();

  if (res.status === 201) {
    console.log(`[SEED] Test bot created: ${TEST_BOT_EMAIL}`);
    return true;
  }
  if (res.status === 409) {
    console.log(`[SEED] Test bot already exists: ${TEST_BOT_EMAIL}`);
    return true;
  }

  console.error(`[SEED] Failed: ${data.error}`);
  return false;
}

async function main() {
  if (!TEST_BOT_EMAIL || !TEST_BOT_PASSWORD) {
    console.error("[SEED] TEST_BOT_EMAIL and TEST_BOT_PASSWORD env vars are required");
    process.exit(1);
  }
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const ok = await seedViaApi(baseUrl);
  if (!ok) process.exit(1);

  console.log(`\n[SEED] Bot seeded successfully.`);
  console.log(`[SEED] Set TEST_BOT_EMAIL and TEST_BOT_PASSWORD as GitHub Actions secrets.`);
}

main().catch(console.error);
