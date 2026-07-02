import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "proteus.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initDb(db);
  }
  return db;
}

function initDb(database: Database.Database) {
  database.exec(`
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
}

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

export function saveRun(data: {
  jd_text?: string;
  jd_source?: string;
  resume_text?: string;
  resume_source?: string;
  status?: string;
}): number {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO application_runs (created_at, jd_text, jd_source, resume_text, resume_source, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    new Date().toISOString(),
    data.jd_text || null,
    data.jd_source || null,
    data.resume_text || null,
    data.resume_source || null,
    data.status || "pending"
  );
  return Number(result.lastInsertRowid);
}

export function updateRun(
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
): void {
  const database = getDb();
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

  values.push(runId);
  database.prepare(`UPDATE application_runs SET ${updates.join(", ")} WHERE id = ?`).run(...values);
}

export function getRun(runId: number): DbRun | null {
  const database = getDb();
  const stmt = database.prepare("SELECT * FROM application_runs WHERE id = ?");
  return stmt.get(runId) as DbRun | null;
}

export function listRuns(limit: number = 50, offset: number = 0): DbRun[] {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT * FROM application_runs ORDER BY created_at DESC LIMIT ? OFFSET ?"
  );
  return stmt.all(limit, offset) as DbRun[];
}

export function deleteRun(runId: number): boolean {
  const database = getDb();
  const stmt = database.prepare("DELETE FROM application_runs WHERE id = ?");
  const result = stmt.run(runId);
  return result.changes > 0;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
