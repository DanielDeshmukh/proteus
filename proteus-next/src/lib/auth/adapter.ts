import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters";

const AUTH_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    email_verified INTEGER,
    image TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, provider_account_id)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires INTEGER NOT NULL,
    UNIQUE(identifier, token)
  );
  CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
  CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification_tokens(identifier);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

let authSchemaReady = false;

async function ensureAuthSchema(client: any) {
  if (authSchemaReady) return;
  const stmts = AUTH_SCHEMA.split(";").filter((s) => s.trim());
  for (const stmt of stmts) {
    await client.execute(stmt.trim());
  }
  authSchemaReady = true;
}

function getDb() {
  const DB_URL = process.env.DATABASE_URL;
  if (DB_URL) {
    const { createClient } = require("@libsql/client");
    const client = createClient({
      url: DB_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return { type: "libsql" as const, client };
  }
  const Database = require("better-sqlite3");
  const path = require("path");
  const db = new Database(path.join(process.cwd(), "proteus.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(AUTH_SCHEMA);
  return { type: "sqlite" as const, db };
}

async function execQuery(db: ReturnType<typeof getDb>, sql: string, args: unknown[] = []) {
  if (db.type === "libsql") {
    const result = await db.client.execute({ sql, args });
    return result;
  }
  return db.db.prepare(sql).all(...args);
}

async function execRun(db: ReturnType<typeof getDb>, sql: string, args: unknown[] = []) {
  if (db.type === "libsql") {
    const result = await db.client.execute({ sql, args });
    return { lastID: Number(result.lastInsertRowid), changes: result.rowsAffected };
  }
  const result = db.db.prepare(sql).run(...args);
  return { lastID: result.lastInsertRowid, changes: result.changes };
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function createTursoAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const id = generateId();
      const db = getDb();
      if (db.type === "libsql") await ensureAuthSchema(db.client);
      await execRun(db,
        `INSERT INTO users (id, name, email, email_verified, image) VALUES (?, ?, ?, ?, ?)`,
        [id, user.name ?? null, user.email ?? null, user.emailVerified ? Math.floor(user.emailVerified.getTime() / 1000) : null, user.image ?? null]
      );
      return { id, ...user } as AdapterUser;
    },

    async getUser(id: string) {
      const db = getDb();
      const rows = await execQuery(db, `SELECT * FROM users WHERE id = ?`, [id]);
      const row = Array.isArray(rows) ? rows[0] : rows.rows?.[0];
      if (!row) return null;
      return mapUser(row);
    },

    async getUserByEmail(email: string) {
      const db = getDb();
      const rows = await execQuery(db, `SELECT * FROM users WHERE email = ?`, [email]);
      const row = Array.isArray(rows) ? rows[0] : rows.rows?.[0];
      if (!row) return null;
      return mapUser(row);
    },

    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      const db = getDb();
      const rows = await execQuery(db,
        `SELECT u.* FROM users u INNER JOIN accounts a ON a.user_id = u.id WHERE a.provider = ? AND a.provider_account_id = ?`,
        [provider, providerAccountId]
      );
      const row = Array.isArray(rows) ? rows[0] : rows.rows?.[0];
      if (!row) return null;
      return mapUser(row);
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      const db = getDb();
      const fields: string[] = [];
      const values: unknown[] = [];
      if (user.name !== undefined) { fields.push("name = ?"); values.push(user.name); }
      if (user.email !== undefined) { fields.push("email = ?"); values.push(user.email); }
      if (user.emailVerified !== undefined) { fields.push("email_verified = ?"); values.push(user.emailVerified ? Math.floor(user.emailVerified.getTime() / 1000) : null); }
      if (user.image !== undefined) { fields.push("image = ?"); values.push(user.image); }
      if (fields.length > 0) {
        values.push(user.id);
        await execRun(db, `UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
      }
      const rows = await execQuery(db, `SELECT * FROM users WHERE id = ?`, [user.id]);
      const row = Array.isArray(rows) ? rows[0] : rows.rows?.[0];
      return mapUser(row as Record<string, unknown>);
    },

    async deleteUser(userId: string) {
      const db = getDb();
      await execRun(db, `DELETE FROM users WHERE id = ?`, [userId]);
    },

    async linkAccount(account: AdapterAccount) {
      const db = getDb();
      const id = generateId();
      await execRun(db,
        `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, account.userId, account.type, account.provider, account.providerAccountId,
         account.refreshToken ?? null, account.accessToken ?? null, account.expiresAt ?? null,
         account.tokenType ?? null, account.scope ?? null, account.idToken ?? null, account.sessionState ?? null]
      );
      return account;
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      const db = getDb();
      await execRun(db,
        `DELETE FROM accounts WHERE provider = ? AND provider_account_id = ?`,
        [provider, providerAccountId]
      );
    },

    async createSession({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }) {
      const db = getDb();
      await execRun(db,
        `INSERT INTO sessions (id, session_token, user_id, expires) VALUES (?, ?, ?, ?)`,
        [generateId(), sessionToken, userId, Math.floor(expires.getTime() / 1000)]
      );
      return { sessionToken, userId, expires };
    },

    async getSessionAndUser(sessionToken: string) {
      const db = getDb();
      const rows = await execQuery(db,
        `SELECT s.*, u.id as uid, u.name, u.email, u.email_verified, u.image, u.created_at as u_created_at
         FROM sessions s INNER JOIN users u ON u.id = s.user_id WHERE s.session_token = ?`,
        [sessionToken]
      );
      const row = Array.isArray(rows) ? rows[0] : rows.rows?.[0];
      if (!row) return null;
      const session: AdapterSession = {
        sessionToken: row.session_token as string,
        userId: row.user_id as string,
        expires: new Date((row.expires as number) * 1000),
      };
      const user = mapUser(row, "uid");
      return { session, user };
    },

    async updateSession({ sessionToken, expires }: { sessionToken: string; expires: Date }) {
      const db = getDb();
      await execRun(db,
        `UPDATE sessions SET expires = ? WHERE session_token = ?`,
        [Math.floor(expires.getTime() / 1000), sessionToken]
      );
      const rows = await execQuery(db, `SELECT user_id FROM sessions WHERE session_token = ?`, [sessionToken]);
      const row = Array.isArray(rows) ? rows[0] : rows.rows?.[0];
      return { sessionToken, userId: row?.user_id as string, expires };
    },

    async deleteSession(sessionToken: string) {
      const db = getDb();
      await execRun(db, `DELETE FROM sessions WHERE session_token = ?`, [sessionToken]);
    },

    async createVerificationToken({ identifier, token, expires }: VerificationToken) {
      const db = getDb();
      await execRun(db,
        `INSERT INTO verification_tokens (identifier, token, expires) VALUES (?, ?, ?)`,
        [identifier, token, Math.floor(expires.getTime() / 1000)]
      );
      return { identifier, token, expires };
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const db = getDb();
      const rows = await execQuery(db,
        `SELECT * FROM verification_tokens WHERE identifier = ? AND token = ?`,
        [identifier, token]
      );
      const row = Array.isArray(rows) ? rows[0] : rows.rows?.[0];
      if (!row) return null;
      await execRun(db,
        `DELETE FROM verification_tokens WHERE identifier = ? AND token = ?`,
        [identifier, token]
      );
      return {
        identifier: row.identifier as string,
        token: row.token as string,
        expires: new Date((row.expires as number) * 1000),
      };
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: Record<string, unknown>, idKey = "id"): AdapterUser {
  return {
    id: String(row[idKey] ?? ""),
    name: (row.name as string) ?? null,
    email: (row.email as string) ?? null,
    emailVerified: row.email_verified ? new Date((row.email_verified as number) * 1000) : null,
    image: (row.image as string) ?? null,
  };
}
