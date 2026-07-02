import path from "path";

// ─────────────────────────────────────────────────────────
// Database abstraction: better-sqlite3 (local) or libsql (Vercel)
// ─────────────────────────────────────────────────────────

const DB_URL = process.env.DATABASE_URL;
const isVercel = !!DB_URL;

export interface DbRun {
  id: number;
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

// ─────────────────────────────────────────────────────────
// SQLite schema (shared between backends)
// ─────────────────────────────────────────────────────────

const SCHEMA = `
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
`;

// ─────────────────────────────────────────────────────────
// LibSQL backend (Vercel / Turso)
// ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let libsqlClient: any = null;

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

async function initLibsql() {
  const client = getLibsql();
  await client.execute(SCHEMA);
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
    sqliteDb = d;
  }
  return sqliteDb;
}

// ─────────────────────────────────────────────────────────
// Unified API
// ─────────────────────────────────────────────────────────

export async function saveRun(data: {
  jd_text?: string;
  jd_source?: string;
  resume_text?: string;
  resume_source?: string;
  status?: string;
}): Promise<number> {
  const now = new Date().toISOString();

  if (isVercel) {
    const client = getLibsql();
    const result = await client.execute({
      sql: `INSERT INTO application_runs (created_at, jd_text, jd_source, resume_text, resume_source, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
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
    INSERT INTO application_runs (created_at, jd_text, jd_source, resume_text, resume_source, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
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

  if (isVercel) {
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
  if (isVercel) {
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

export async function listRuns(limit: number = 50, offset: number = 0): Promise<DbRun[]> {
  if (isVercel) {
    const client = getLibsql();
    const result = await client.execute({
      sql: "SELECT * FROM application_runs ORDER BY created_at DESC LIMIT ? OFFSET ?",
      args: [limit, offset],
    });
    return result.rows as unknown as DbRun[];
  }

  const db = getSqlite();
  return db
    .prepare("SELECT * FROM application_runs ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as DbRun[];
}

export async function deleteRun(runId: number): Promise<boolean> {
  if (isVercel) {
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
