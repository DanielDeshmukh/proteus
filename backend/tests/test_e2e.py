"""
End-to-end tests for the PROTEUS pipeline.
Tests full flow through the API: paste JD + resume -> results -> history.
"""
import pytest
import json
import time
from unittest.mock import patch
from httpx import AsyncClient, ASGITransport
from main import app
from db.sqlite_store import init_db
from agents.jd_models import JDStructured
from agents.resume_models import ResumeStructured, ExperienceBullet
from agents.gap_models import GapAnalysis, GapItem, MatchStatus
from agents.rewrite_models import RewriteOutput, RewriteSuggestion
from agents.cover_letter_models import CoverLetterOutput, CoverLetterSection, Tone
from agents.aggregator import PipelineOutput, ActionItem


SAMPLE_JD = """Senior Backend Engineer — Veridian Health

We're hiring a senior backend engineer to own core services for our clinical data platform.
You'll design distributed systems in Python and Go, operate Kubernetes-based deployments,
and build event-driven pipelines on Kafka. Experience handling PHI under HIPAA is required.

Requirements:
- 5+ years backend engineering experience
- Python and/or Go proficiency
- Kubernetes and container orchestration
- Kafka or similar event-driven systems
- HIPAA compliance experience
- Strong system design skills"""

SAMPLE_RESUME = """Alex Reyes — Backend Engineer

Experience:
Backend Engineer · Solace Systems (2022–2026)
- Built REST APIs for internal services using Flask, supporting 6 product teams
- Used message queues to process background jobs across 4 microservices
- Migrated primary datastore from MySQL to Postgres with zero downtime
- Mentored 2 junior engineers during onboarding

Skills: Python, Flask, PostgreSQL, Docker, Redis, RabbitMQ"""


def _mock_jd():
    return JDStructured(
        title="Senior Backend Engineer",
        company="Veridian Health",
        seniority_level="senior",
        hard_skills=["Python", "Go", "Kubernetes", "Kafka", "System Design"],
        soft_skills=["Mentorship", "Communication"],
        domain_keywords=["HIPAA", "Clinical Data", "Healthcare"],
        ats_bait=["Python", "Go", "Kubernetes", "Kafka"],
        requirements_summary="Senior backend engineer for clinical data platform",
    )


def _mock_resume():
    return ResumeStructured(
        name="Alex Reyes",
        skills=["Python", "Flask", "PostgreSQL", "Docker", "Redis", "RabbitMQ"],
        experience=[
            ExperienceBullet(
                role="Backend Engineer",
                company="Solace Systems",
                duration="2022-2026",
                bullets=[
                    "Built REST APIs for internal services using Flask, supporting 6 product teams",
                    "Used message queues to process background jobs across 4 microservices",
                    "Migrated primary datastore from MySQL to Postgres with zero downtime",
                    "Mentored 2 junior engineers during onboarding",
                ],
            )
        ],
    )


def _mock_gap_analysis():
    return GapAnalysis(
        overall_match=0.68,
        gaps=[
            GapItem(requirement="Kubernetes and container orchestration", category="hard_skill", status=MatchStatus.MISSING, similarity_score=0.3),
            GapItem(requirement="HIPAA compliance experience", category="domain_keyword", status=MatchStatus.MISSING, similarity_score=0.1),
            GapItem(requirement="Kafka or similar event-driven systems", category="hard_skill", status=MatchStatus.PARTIAL, similarity_score=0.55),
            GapItem(requirement="Python and/or Go proficiency", category="hard_skill", status=MatchStatus.MATCHED, similarity_score=0.85),
            GapItem(requirement="Strong system design skills", category="hard_skill", status=MatchStatus.PARTIAL, similarity_score=0.5),
            GapItem(requirement="5+ years backend engineering experience", category="hard_skill", status=MatchStatus.PARTIAL, similarity_score=0.6),
        ],
        matched_count=1,
        partial_count=3,
        missing_count=2,
        total_requirements=6,
    )


def _mock_rewrites():
    return RewriteOutput(
        suggestions=[
            RewriteSuggestion(
                original_bullet="Used message queues to process background jobs across 4 microservices",
                suggested_rewrite="Architected an event-driven processing layer with RabbitMQ, decoupling 4 microservices and cutting job latency by 45%",
                target_requirement="Kafka or similar event-driven systems",
                impact_score=0.7,
                rationale="Directly addresses the event-driven gap",
            )
        ],
        hidden_experience=["Docker experience could frame as container orchestration"],
    )


def _mock_cover_letter():
    return CoverLetterOutput(
        full_letter="Dear Hiring Team,\n\nI'm writing to apply for the Senior Backend Engineer role...",
        sections=[
            CoverLetterSection(heading="Opening", content="I'm writing to apply..."),
            CoverLetterSection(heading="Why This Role", content="My experience aligns..."),
        ],
        key_points_addressed=["Event-driven architecture", "Python proficiency"],
        word_count=150,
        tone=Tone.PROFESSIONAL,
    )


def _mock_aggregated():
    return PipelineOutput(
        overall_score=0.68,
        section_scores={"hard_skills": 0.72, "domain_keywords": 0.35, "soft_skills": 0.8, "ats_bait": 0.65},
        action_list=[
            ActionItem(priority=1, action="Add Kubernetes experience", impact="high", category="add_skill"),
            ActionItem(priority=2, action="Reframe message queue work as event-driven", impact="medium", category="rewrite"),
        ],
        summary="Overall match: 68%. 1/6 requirements matched. 2 missing.",
    )


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()
    yield
    import os
    from db.sqlite_store import DB_PATH
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)


@pytest.mark.anyio
async def test_e2e_full_flow_paste_jd_and_resume():
    """Full flow: paste JD + paste resume -> get results -> check history -> delete."""
    with patch("pipeline.parse_jd", return_value=_mock_jd()), \
         patch("pipeline.parse_resume", return_value=_mock_resume()), \
         patch("pipeline.analyze_gaps", return_value=_mock_gap_analysis()), \
         patch("pipeline.suggest_rewrites", return_value=_mock_rewrites()), \
         patch("pipeline.generate_cover_letter", return_value=_mock_cover_letter()), \
         patch("pipeline.aggregate_scores", return_value=_mock_aggregated()):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Step 1: Run analysis
            response = await client.post("/api/analyze", data={
                "jd_text": SAMPLE_JD,
                "resume_text": SAMPLE_RESUME,
            })
            assert response.status_code == 200
            data = response.json()

            assert data["overall_score"] is not None
            assert 0 <= data["overall_score"] <= 1
            assert data["section_scores"] is not None
            assert "hard_skills" in data["section_scores"]
            assert data["gap_analysis"] is not None
            assert data["gap_analysis"]["total_requirements"] == 6
            assert data["rewrite_suggestions"] is not None
            assert len(data["rewrite_suggestions"]["suggestions"]) >= 1
            assert data["cover_letter"] is not None
            assert data["cover_letter"]["word_count"] > 0
            assert data["action_list"] is not None
            assert len(data["action_list"]) >= 1
            assert data["timings"] is not None
            assert data["timings"]["total"] > 0

            run_id = data["run_id"]

            # Step 2: Check history
            response = await client.get("/api/history")
            assert response.status_code == 200
            history = response.json()
            assert history["count"] >= 1

            # Step 3: Get run detail
            response = await client.get(f"/api/history/{run_id}")
            assert response.status_code == 200
            detail = response.json()
            assert detail["status"] == "completed"
            assert detail["overall_score"] is not None

            # Step 4: Delete run
            response = await client.delete(f"/api/history/{run_id}")
            assert response.status_code == 200
            assert response.json()["deleted"] is True

            # Step 5: Verify deleted
            response = await client.get(f"/api/history/{run_id}")
            assert response.status_code == 404


@pytest.mark.anyio
async def test_e2e_url_based_jd():
    """E2E: URL-based JD ingestion flow."""
    with patch("main.fetch_jd_from_url", return_value=SAMPLE_JD), \
         patch("pipeline.parse_jd", return_value=_mock_jd()), \
         patch("pipeline.parse_resume", return_value=_mock_resume()), \
         patch("pipeline.analyze_gaps", return_value=_mock_gap_analysis()), \
         patch("pipeline.suggest_rewrites", return_value=_mock_rewrites()), \
         patch("pipeline.generate_cover_letter", return_value=_mock_cover_letter()), \
         patch("pipeline.aggregate_scores", return_value=_mock_aggregated()):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_url": "https://example.com/job-posting",
                "resume_text": SAMPLE_RESUME,
            })
            assert response.status_code == 200
            data = response.json()
            assert data["overall_score"] is not None
            assert data["run_id"] > 0


@pytest.mark.anyio
async def test_e2e_error_no_jd():
    """E2E: Error when no JD provided."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "resume_text": SAMPLE_RESUME,
        })
        assert response.status_code == 400
        assert "job description" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_e2e_error_no_resume():
    """E2E: Error when no resume provided."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", data={
            "jd_text": SAMPLE_JD,
        })
        assert response.status_code == 400
        assert "resume" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_e2e_error_invalid_url():
    """E2E: Error when URL fetch fails."""
    with patch("main.fetch_jd_from_url", side_effect=ValueError("Connection refused")):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_url": "https://invalid.example.com",
                "resume_text": SAMPLE_RESUME,
            })
            assert response.status_code == 400
            assert "failed to fetch" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_e2e_pipeline_timing():
    """E2E: Pipeline completes and reports timing."""
    with patch("pipeline.parse_jd", return_value=_mock_jd()), \
         patch("pipeline.parse_resume", return_value=_mock_resume()), \
         patch("pipeline.analyze_gaps", return_value=_mock_gap_analysis()), \
         patch("pipeline.suggest_rewrites", return_value=_mock_rewrites()), \
         patch("pipeline.generate_cover_letter", return_value=_mock_cover_letter()), \
         patch("pipeline.aggregate_scores", return_value=_mock_aggregated()):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            start = time.perf_counter()
            response = await client.post("/api/analyze", data={
                "jd_text": SAMPLE_JD,
                "resume_text": SAMPLE_RESUME,
            })
            elapsed = time.perf_counter() - start

            assert response.status_code == 200
            data = response.json()
            assert data["timings"]["total"] > 0
            assert elapsed < 10


@pytest.mark.anyio
async def test_e2e_history_pagination():
    """E2E: History endpoint returns correct pagination."""
    from db.sqlite_store import save_run
    for i in range(5):
        await save_run(jd_text=f"JD {i}", status="completed")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/history?limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data["runs"]) == 3
        # API returns count of returned runs, not total
        assert data["count"] == 3


@pytest.mark.anyio
async def test_e2e_analyze_with_file_upload():
    """E2E: Analyze with file upload (text files simulating PDF/DOCX)."""
    with patch("pipeline.parse_jd", return_value=_mock_jd()), \
         patch("pipeline.parse_resume", return_value=_mock_resume()), \
         patch("pipeline.analyze_gaps", return_value=_mock_gap_analysis()), \
         patch("pipeline.suggest_rewrites", return_value=_mock_rewrites()), \
         patch("pipeline.generate_cover_letter", return_value=_mock_cover_letter()), \
         patch("pipeline.aggregate_scores", return_value=_mock_aggregated()):

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            jd_file = ("jd.txt", SAMPLE_JD.encode(), "text/plain")
            resume_file = ("resume.txt", SAMPLE_RESUME.encode(), "text/plain")
            response = await client.post(
                "/api/analyze",
                files={"jd_file": jd_file, "resume_file": resume_file},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["overall_score"] is not None
