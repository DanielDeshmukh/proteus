import pytest
import json
from httpx import AsyncClient, ASGITransport
from main import app
from db.sqlite_store import init_db


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()
    yield
    import os
    from db.sqlite_store import DB_PATH
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)


@pytest.mark.anyio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.anyio
async def test_analyze_no_jd():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={"resume_text": "Some resume"})
    assert response.status_code == 400
    assert "job description" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_analyze_no_resume():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={"jd_text": "Some JD"})
    assert response.status_code == 400
    assert "resume" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_history_empty():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "runs" in data
    assert "count" in data


@pytest.mark.anyio
async def test_get_run_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history/99999")
    assert response.status_code == 404


@pytest.mark.anyio
async def test_delete_run_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.delete("/api/history/99999")
    assert response.status_code == 404


@pytest.mark.anyio
async def test_history_after_save():
    from db.sqlite_store import save_run
    await save_run(jd_text="Test JD", status="completed")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1


@pytest.mark.anyio
async def test_get_run_detail():
    from db.sqlite_store import save_run
    run_id = await save_run(jd_text="Detail JD", status="completed")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/history/{run_id}")
    assert response.status_code == 200
    assert response.json()["jd_text"] == "Detail JD"


@pytest.mark.anyio
async def test_delete_run():
    from db.sqlite_store import save_run
    run_id = await save_run(jd_text="Delete me", status="pending")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.delete(f"/api/history/{run_id}")
    assert response.status_code == 200
    assert response.json()["deleted"] is True


@pytest.mark.anyio
async def test_analyze_stream_no_jd():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze/stream", data={"resume_text": "Some resume"})
    assert response.status_code == 400


@pytest.mark.anyio
async def test_analyze_stream_no_resume():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze/stream", data={"jd_text": "Some JD"})
    assert response.status_code == 400
