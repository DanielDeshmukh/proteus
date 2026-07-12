import path from "path";

// ─────────────────────────────────────────────────────────
// Database abstraction: better-sqlite3 (local) or libsql (Turso)
// ─────────────────────────────────────────────────────────

const DB_URL = process.env.DATABASE_URL;
const useLibsql = !!DB_URL;

export interface DbRun {
  id: number;
  user_id: string | null;
  created_at: string;
  jd_text: string | null;
  jd_source: string | null;
  resume_text: string | null;
  resume_source: string | null;
  overall_score: number | null;
  section_scores: string | null;
  gap_analysis: string | null;
  rewrite_suggestions: string | null;
  cover_letter: string | null;
  action_list: string | null;
  status: string;
  error_message: string | null;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS application_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
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
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    window_start TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
    ON rate_limits(user_id, action, window_start);
`;

const MIGRATE_USER_ID = `ALTER TABLE application_runs ADD COLUMN user_id TEXT`;

// ─── Rate Limiting ──────────────────────────────────────

const DEFAULT_DAILY_LIMIT = 10;

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  resetsAt: string;
}

function getTodayWindow(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function checkRateLimit(
  userId: string,
  action: string = "analyze",
  limit: number = DEFAULT_DAILY_LIMIT
): Promise<RateLimitResult> {
  const window = getTodayWindow();
  const resetsAt = `${window}T23:59:59Z`;

  if (useLibsql) {
    await ensureLibsql();
    const client = getLibsql();
    const result = await client.execute({
      sql: "SELECT count FROM rate_limits WHERE user_id = ? AND action = ? AND window_start = ?",
      args: [userId, action, window],
    });
    const current = (result.rows[0] as { count: number } | undefined)?.count || 0;
    return { allowed: current < limit, current, limit, resetsAt };
  }

  const db = getSqlite();
  const row = db
    .prepare("SELECT count FROM rate_limits WHERE user_id = ? AND action = ? AND window_start = ?")
    .get(userId, action, window) as { count: number } | undefined;
  const current = row?.count || 0;
  return { allowed: current < limit, current, limit, resetsAt };
}

export async function incrementRateLimit(
  userId: string,
  action: string = "analyze"
): Promise<void> {
  const window = getTodayWindow();

  if (useLibsql) {
    await ensureLibsql();
    const client = getLibsql();
    const existing = await client.execute({
      sql: "SELECT id FROM rate_limits WHERE user_id = ? AND action = ? AND window_start = ?",
      args: [userId, action, window],
    });
    if (existing.rows.length > 0) {
      await client.execute({
        sql: "UPDATE rate_limits SET count = count + 1 WHERE user_id = ? AND action = ? AND window_start = ?",
        args: [userId, action, window],
      });
    } else {
      await client.execute({
        sql: "INSERT INTO rate_limits (user_id, action, window_start, count) VALUES (?, ?, ?, 1)",
        args: [userId, action, window],
      });
    }
    return;
  }

  const db = getSqlite();
  const existing = db
    .prepare("SELECT id FROM rate_limits WHERE user_id = ? AND action = ? AND window_start = ?")
    .get(userId, action, window);
  if (existing) {
    db.prepare("UPDATE rate_limits SET count = count + 1 WHERE user_id = ? AND action = ? AND window_start = ?")
      .run(userId, action, window);
  } else {
    db.prepare("INSERT INTO rate_limits (user_id, action, window_start, count) VALUES (?, ?, ?, 1)")
      .run(userId, action, window);
  }
}

export async function getUsageStats(userId: string): Promise<{ used: number; limit: number; resetsAt: string }> {
  const limit = DEFAULT_DAILY_LIMIT;
  const result = await checkRateLimit(userId, "analyze", limit);
  return { used: result.current, limit: result.limit, resetsAt: result.resetsAt };
}

// ─────────────────────────────────────────────────────────
// LibSQL backend (Turso)
// ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let libsqlClient: any = null;
let libsqlReady = false;

function getLibsql(): any {
  if (!libsqlClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const { createClient } = require("@libsql/client") as { createClient: (...args: any[]) => any };
    libsqlClient = createClient({
      url: DB_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return libsqlClient;
}

async function ensureLibsql() {
  if (!libsqlReady) {
    const client = getLibsql();
    await client.execute(SCHEMA);
    try {
      await client.execute(MIGRATE_USER_ID);
    } catch { /* column already exists */ }
    libsqlReady = true;
  }
}

// ─────────────────────────────────────────────────────────
// better-sqlite3 backend (local dev)
// ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteDb: any = null;

function getSqlite(): any {
  if (!sqliteDb) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    const DB_PATH = path.join(process.cwd(), "proteus.db");
    const d = new Database(DB_PATH);
    d.pragma("journal_mode = WAL");
    d.pragma("foreign_keys = ON");
    d.exec(SCHEMA);
    try { d.exec(MIGRATE_USER_ID); } catch { /* column already exists */ }
    sqliteDb = d;
  }
  return sqliteDb;
}

// ─────────────────────────────────────────────────────────
// Unified API
// ─────────────────────────────────────────────────────────

export async function saveRun(data: {
  user_id?: string | null;
  jd_text?: string;
  jd_source?: string;
  resume_text?: string;
  resume_source?: string;
  status?: string;
}): Promise<number> {
  const now = new Date().toISOString();

  if (useLibsql) {
    await ensureLibsql();
    const client = getLibsql();
    const result = await client.execute({
      sql: `INSERT INTO application_runs (user_id, created_at, jd_text, jd_source, resume_text, resume_source, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.user_id || null,
        now,
        data.jd_text || null,
        data.jd_source || null,
        data.resume_text || null,
        data.resume_source || null,
        data.status || "pending",
      ],
    });
    return Number(result.lastInsertRowid);
  }

  const db = getSqlite();
  const stmt = db.prepare(`
    INSERT INTO application_runs (user_id, created_at, jd_text, jd_source, resume_text, resume_source, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.user_id || null,
    now,
    data.jd_text || null,
    data.jd_source || null,
    data.resume_text || null,
    data.resume_source || null,
    data.status || "pending"
  );
  return Number(result.lastInsertRowid);
}

export async function updateRun(
  runId: number,
  data: {
    overall_score?: number | null;
    section_scores?: string | null;
    gap_analysis?: string | null;
    rewrite_suggestions?: string | null;
    cover_letter?: string | null;
    action_list?: string | null;
    status?: string;
    error_message?: string | null;
  }
): Promise<void> {
  const allowed = new Set([
    "overall_score",
    "section_scores",
    "gap_analysis",
    "rewrite_suggestions",
    "cover_letter",
    "action_list",
    "status",
    "error_message",
  ]);

  const updates: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (allowed.has(key) && value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) return;

  if (useLibsql) {
    await ensureLibsql();
    const client = getLibsql();
    values.push(runId);
    await client.execute({
      sql: `UPDATE application_runs SET ${updates.join(", ")} WHERE id = ?`,
      args: values,
    });
    return;
  }

  const db = getSqlite();
  values.push(runId);
  db.prepare(`UPDATE application_runs SET ${updates.join(", ")} WHERE id = ?`).run(...values);
}

export async function getRun(runId: number): Promise<DbRun | null> {
  if (useLibsql) {
    await ensureLibsql();
    const client = getLibsql();
    const result = await client.execute({
      sql: "SELECT * FROM application_runs WHERE id = ?",
      args: [runId],
    });
    return (result.rows[0] as unknown as DbRun) || null;
  }

  const db = getSqlite();
  return db.prepare("SELECT * FROM application_runs WHERE id = ?").get(runId) as DbRun | null;
}

export async function listRuns(limit: number = 50, offset: number = 0, userId?: string): Promise<DbRun[]> {
  if (useLibsql) {
    await ensureLibsql();
    const client = getLibsql();
    if (userId) {
      const result = await client.execute({
        sql: "SELECT * FROM application_runs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        args: [userId, limit, offset],
      });
      return result.rows as unknown as DbRun[];
    }
    const result = await client.execute({
      sql: "SELECT * FROM application_runs ORDER BY created_at DESC LIMIT ? OFFSET ?",
      args: [limit, offset],
    });
    return result.rows as unknown as DbRun[];
  }

  const db = getSqlite();
  if (userId) {
    return db
      .prepare("SELECT * FROM application_runs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .all(userId, limit, offset) as DbRun[];
  }
  return db
    .prepare("SELECT * FROM application_runs ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as DbRun[];
}

export async function deleteRun(runId: number): Promise<boolean> {
  if (useLibsql) {
    await ensureLibsql();
    const client = getLibsql();
    const result = await client.execute({
      sql: "DELETE FROM application_runs WHERE id = ?",
      args: [runId],
    });
    return result.rowsAffected > 0;
  }

  const db = getSqlite();
  const result = db.prepare("DELETE FROM application_runs WHERE id = ?").run(runId);
  return result.changes > 0;
}

export function closeDb(): void {
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
  if (libsqlClient) {
    libsqlClient.close();
    libsqlClient = null;
  }
}
