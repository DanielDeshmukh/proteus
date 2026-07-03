const fs = require("fs");
const { createClient } = require("@libsql/client");

// Read .env manually
const envContent = fs.readFileSync(".env", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq > 0) env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
}

const c = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

async function main() {
  await c.execute(`
    CREATE TABLE IF NOT EXISTS application_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      jd_text TEXT,
      jd_source TEXT,
      resume_text TEXT,
      resume_source TEXT,
      overall_score REAL,
      section_scores TEXT,
      gap_analysis TEXT,
      rewrite_suggestions TEXT,
      cover_letter TEXT,
      action_list TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT
    )
  `);
  console.log("Schema created!");

  const tables = await c.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  console.log("Tables:", tables.rows.map((r) => r.name));
}

main().catch(console.error);
