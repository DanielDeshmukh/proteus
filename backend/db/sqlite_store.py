import aiosqlite
import json
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "proteus.db"

CREATE_TABLE_SQL = """
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
);
"""


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(CREATE_TABLE_SQL)
        await db.commit()


async def save_run(
    jd_text: str | None = None,
    jd_source: str | None = None,
    resume_text: str | None = None,
    resume_source: str | None = None,
    status: str = "pending",
) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """INSERT INTO application_runs
               (created_at, jd_text, jd_source, resume_text, resume_source, status)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                datetime.now(timezone.utc).isoformat(),
                jd_text,
                jd_source,
                resume_text,
                resume_source,
                status,
            ),
        )
        await db.commit()
        return cursor.lastrowid


async def update_run(run_id: int, **kwargs) -> None:
    allowed = {
        "overall_score",
        "section_scores",
        "gap_analysis",
        "rewrite_suggestions",
        "cover_letter",
        "action_list",
        "status",
        "error_message",
    }
    updates = {k: v for k, v in kwargs.items() if k in allowed}
    if not updates:
        return
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values())
    values.append(run_id)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            f"UPDATE application_runs SET {set_clause} WHERE id = ?",
            values,
        )
        await db.commit()


async def get_run(run_id: int) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM application_runs WHERE id = ?", (run_id,)
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return dict(row)


async def list_runs(limit: int = 50, offset: int = 0) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM application_runs ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def delete_run(run_id: int) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "DELETE FROM application_runs WHERE id = ?", (run_id,)
        )
        await db.commit()
        return cursor.rowcount > 0
