import os
import pytest
import aiosqlite
from db.sqlite_store import init_db, save_run, get_run, list_runs, delete_run, DB_PATH


@pytest.fixture
async def setup_db():
    await init_db()
    yield
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)


@pytest.mark.anyio
async def test_init_db(setup_db):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='application_runs'"
        )
        row = await cursor.fetchone()
        assert row is not None


@pytest.mark.anyio
async def test_save_and_get_run(setup_db):
    run_id = await save_run(
        jd_text="Test JD",
        jd_source="paste",
        resume_text="Test Resume",
        resume_source="paste",
        status="pending",
    )
    assert run_id is not None

    run = await get_run(run_id)
    assert run is not None
    assert run["jd_text"] == "Test JD"
    assert run["status"] == "pending"


@pytest.mark.anyio
async def test_list_runs(setup_db):
    await save_run(jd_text="JD 1", status="completed")
    await save_run(jd_text="JD 2", status="completed")

    runs = await list_runs()
    assert len(runs) == 2


@pytest.mark.anyio
async def test_delete_run(setup_db):
    run_id = await save_run(jd_text="To delete", status="pending")
    deleted = await delete_run(run_id)
    assert deleted is True

    run = await get_run(run_id)
    assert run is None
