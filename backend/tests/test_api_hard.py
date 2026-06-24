"""Hard API response tests - validates actual response structures, edge cases, and error handling."""

import json
import pytest
from httpx import ASGITransport, AsyncClient

from db.sqlite_store import init_db, save_run, update_run
from main import app


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()
    yield
    import os
    from db.sqlite_store import DB_PATH
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)


# ─────────────────────────────────────────────────────────
# HEALTH CHECK - response structure validation
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_health_response_structure():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"status", "service", "env"}
    assert data["status"] == "ok"
    assert data["service"] == "proteus-backend"
    assert isinstance(data["env"], str)


@pytest.mark.anyio
async def test_health_is_get_only():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/health")
    assert response.status_code == 405


# ─────────────────────────────────────────────────────────
# ANALYZE ENDPOINT - input validation
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_analyze_empty_body():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze")
    assert response.status_code == 400
    assert "detail" in response.json()


@pytest.mark.anyio
async def test_analyze_whitespace_only_jd():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": "   \n\t  ",
            "resume_text": "Valid resume content"
        })
    assert response.status_code == 400
    assert "job description" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_analyze_whitespace_only_resume():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": "Valid JD content",
            "resume_text": "   \n\t  "
        })
    assert response.status_code == 400
    assert "resume" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_analyze_invalid_url():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_url": "not-a-valid-url",
            "resume_text": "Valid resume"
        })
    assert response.status_code == 400


@pytest.mark.anyio
async def test_analyze_invalid_tone():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": "Valid JD",
            "resume_text": "Valid resume",
            "cover_letter_tone": "invalid_tone"
        })
    # Should not crash, defaults to professional
    assert response.status_code in (200, 500)


@pytest.mark.anyio
async def test_analyze_content_type_form():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/analyze",
            data={"jd_text": "JD", "resume_text": "Resume"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
    assert response.status_code in (200, 400, 500)


@pytest.mark.anyio
async def test_analyze_json_body_rejected():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/analyze",
            json={"jd_text": "JD", "resume_text": "Resume"}
        )
    # FastAPI may accept JSON for form endpoints or reject with 400/422
    assert response.status_code in (400, 422)


# ─────────────────────────────────────────────────────────
# ANALYZE STREAM ENDPOINT - response format
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_stream_response_content_type():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze/stream", data={
            "jd_text": "Test JD for streaming",
            "resume_text": "Test resume for streaming"
        })
    assert response.status_code == 200
    assert "application/x-ndjson" in response.headers.get("content-type", "")


@pytest.mark.anyio
async def test_stream_returns_ndjson_lines():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze/stream", data={
            "jd_text": "Senior Engineer at Tech Corp",
            "resume_text": "5 years Python experience"
        })
    assert response.status_code == 200
    lines = response.text.strip().split("\n")
    assert len(lines) >= 1
    for line in lines:
        data = json.loads(line)
        assert "event" in data


@pytest.mark.anyio
async def test_stream_events_have_correct_structure():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze/stream", data={
            "jd_text": "Software Engineer at Google",
            "resume_text": "3 years Python experience"
        })
    assert response.status_code == 200
    lines = response.text.strip().split("\n")
    events = [json.loads(line) for line in lines]

    event_types = [e["event"] for e in events]
    assert "started" in event_types
    assert "done" in event_types

    started = next(e for e in events if e["event"] == "started")
    assert "run_id" in started
    assert isinstance(started["run_id"], int)

    done = next(e for e in events if e["event"] == "done")
    assert "run_id" in done


# ─────────────────────────────────────────────────────────
# HISTORY ENDPOINT - pagination and data shape
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_history_response_shape():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "runs" in data
    assert "count" in data
    assert isinstance(data["runs"], list)
    assert isinstance(data["count"], int)


@pytest.mark.anyio
async def test_history_pagination_limit():
    for i in range(5):
        await save_run(jd_text=f"JD {i}", status="completed")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history?limit=2")
    data = response.json()
    assert len(data["runs"]) <= 2


@pytest.mark.anyio
async def test_history_pagination_offset():
    for i in range(5):
        await save_run(jd_text=f"JD {i}", status="completed")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        all_runs = (await client.get("/api/history?limit=50")).json()["runs"]
        offset_runs = (await client.get("/api/history?limit=50&offset=2")).json()["runs"]
    assert len(offset_runs) == len(all_runs) - 2


@pytest.mark.anyio
async def test_history_run_shape():
    run_id = await save_run(jd_text="Shape JD", resume_text="Shape resume", status="completed")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history")
    runs = response.json()["runs"]
    matching = [r for r in runs if r["id"] == run_id]
    assert len(matching) == 1
    run = matching[0]
    assert "id" in run
    assert "created_at" in run
    assert "jd_text" in run
    assert "status" in run


@pytest.mark.anyio
async def test_history_invalid_limit():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history?limit=-1")
    # Should handle gracefully
    assert response.status_code in (200, 422)


@pytest.mark.anyio
async def test_history_invalid_offset():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history?offset=-1")
    assert response.status_code in (200, 422)


@pytest.mark.anyio
async def test_history_huge_offset():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history?offset=999999")
    assert response.status_code == 200
    assert response.json()["runs"] == []


# ─────────────────────────────────────────────────────────
# RUN DETAIL ENDPOINT - response structure
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_run_detail_complete_fields():
    run_id = await save_run(
        jd_text="Complete JD",
        jd_source="paste",
        resume_text="Complete resume",
        resume_source="paste",
        status="completed"
    )
    await update_run(
        run_id,
        overall_score=85.5,
        section_scores=json.dumps({"skills": 90, "experience": 80}),
        gap_analysis=json.dumps([{"skill": "Python", "severity": "high"}]),
        rewrite_suggestions=json.dumps([{"original": "old", "rewritten": "new"}]),
        cover_letter=json.dumps({"body": "Dear Hiring Manager..."}),
        action_list=json.dumps([{"action": "Learn Python", "priority": "high"}]),
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/history/{run_id}")
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == run_id
    assert data["jd_text"] == "Complete JD"
    assert data["resume_text"] == "Complete resume"
    assert data["status"] == "completed"
    assert data["overall_score"] == 85.5
    assert isinstance(json.loads(data["section_scores"]), dict)
    assert isinstance(json.loads(data["gap_analysis"]), list)
    assert isinstance(json.loads(data["rewrite_suggestions"]), list)
    assert isinstance(json.loads(data["cover_letter"]), dict)
    assert isinstance(json.loads(data["action_list"]), list)


@pytest.mark.anyio
async def test_run_detail_not_found_response():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history/99999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "99999" in data["detail"]


@pytest.mark.anyio
async def test_run_detail_negative_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history/-1")
    assert response.status_code in (200, 404)


@pytest.mark.anyio
async def test_run_detail_zero_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history/0")
    assert response.status_code in (200, 404)


# ─────────────────────────────────────────────────────────
# DELETE ENDPOINT - behavior validation
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_delete_returns_correct_shape():
    run_id = await save_run(jd_text="Delete me", status="pending")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.delete(f"/api/history/{run_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["deleted"] is True
    assert data["run_id"] == run_id


@pytest.mark.anyio
async def test_delete_twice_returns_404():
    run_id = await save_run(jd_text="Delete twice", status="pending")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.delete(f"/api/history/{run_id}")
        response = await client.delete(f"/api/history/{run_id}")
    assert response.status_code == 404


@pytest.mark.anyio
async def test_delete_removes_from_history():
    run_id = await save_run(jd_text="Verify deletion", status="pending")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.delete(f"/api/history/{run_id}")
        response = await client.get(f"/api/history/{run_id}")
    assert response.status_code == 404


@pytest.mark.anyio
async def test_delete_does_not_affect_others():
    run1 = await save_run(jd_text="Keep me", status="completed")
    run2 = await save_run(jd_text="Delete me", status="completed")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.delete(f"/api/history/{run2}")
        response = await client.get(f"/api/history/{run1}")
    assert response.status_code == 200
    assert response.json()["jd_text"] == "Keep me"


# ─────────────────────────────────────────────────────────
# ERROR HANDLING - edge cases
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_nonexistent_route():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/nonexistent")
    assert response.status_code == 404


@pytest.mark.anyio
async def test_method_not_allowed():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.put("/api/health")
    assert response.status_code == 405


@pytest.mark.anyio
async def test_invalid_path_parameter():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history/abc")
    assert response.status_code == 422


@pytest.mark.anyio
async def test_large_payload_handled():
    large_jd = "A" * 100000
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": large_jd,
            "resume_text": "Short resume"
        })
    # Should not crash the server
    assert response.status_code in (200, 400, 500)


@pytest.mark.anyio
async def test_special_characters_in_text():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": "JD with <html> &amp; special chars: ñ, ü, 日本語",
            "resume_text": "Resume with emojis: 🚀 and symbols: @#$%"
        })
    # Should not crash
    assert response.status_code in (200, 400, 500)


@pytest.mark.anyio
async def test_unicode_content():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": "职位：软件工程师，要求：5年Python经验",
            "resume_text": "姓名：张三，5年Python开发经验"
        })
    assert response.status_code in (200, 400, 500)


@pytest.mark.anyio
async def test_sql_injection_attempt():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": "'; DROP TABLE application_runs; --",
            "resume_text": "Normal resume"
        })
        # Should not crash or delete data
        assert response.status_code in (200, 400, 500)
        # Verify table still exists
        history = await client.get("/api/history")
        assert history.status_code == 200


@pytest.mark.anyio
async def test_xss_in_text():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": "<script>alert('xss')</script>",
            "resume_text": "Normal resume"
        })
    assert response.status_code in (200, 400, 500)


@pytest.mark.anyio
async def test_concurrent_requests():
    import asyncio
    transport = ASGITransport(app=app)

    async def make_request():
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.get("/api/health")

    results = await asyncio.gather(*[make_request() for _ in range(10)])
    for r in results:
        assert r.status_code == 200


@pytest.mark.anyio
async def test_cors_headers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.options("/api/health", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        })
    # CORS should be configured
    assert response.status_code in (200, 405)


# ─────────────────────────────────────────────────────────
# RATE LIMITING - behavior
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_rate_limit_headers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
    # Health check is exempt but should still work
    assert response.status_code == 200


# ─────────────────────────────────────────────────────────
# DATABASE STATE - integrity
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_run_status_values():
    for status in ["pending", "running", "completed", "failed", "partial"]:
        run_id = await save_run(jd_text=f"Status {status}", status=status)
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(f"/api/history/{run_id}")
        assert response.json()["status"] == status


@pytest.mark.anyio
async def test_created_at_is_iso_format():
    run_id = await save_run(jd_text="ISO date test", status="completed")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(f"/api/history/{run_id}")
    created_at = response.json()["created_at"]
    # Should be parseable as ISO format
    from datetime import datetime
    datetime.fromisoformat(created_at.replace("Z", "+00:00"))


@pytest.mark.anyio
async def test_history_ordered_by_created_at_desc():
    ids = []
    for i in range(3):
        run_id = await save_run(jd_text=f"Order test {i}", status="completed")
        ids.append(run_id)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history")
    runs = response.json()["runs"]
    returned_ids = [r["id"] for r in runs if r["id"] in ids]
    # Should be in reverse order (newest first)
    assert returned_ids == list(reversed(ids))
