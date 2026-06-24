"""Response quality tests - validates actual content quality and edge cases in API responses."""

import json
import pytest
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient

from agents.aggregator import ActionItem, PipelineOutput
from agents.cover_letter_models import CoverLetterOutput, CoverLetterSection, Tone
from agents.gap_models import GapAnalysis, GapItem, MatchStatus
from agents.jd_models import JDStructured
from agents.resume_models import ExperienceBullet, ResumeStructured
from agents.rewrite_models import RewriteOutput, RewriteSuggestion
from db.sqlite_store import init_db, save_run, update_run
from main import app


# ─────────────────────────────────────────────────────────
# MOCK DATA - realistic scenarios
# ─────────────────────────────────────────────────────────

def _mock_jd_strong_match():
    return JDStructured(
        title="Senior Python Developer",
        company="TechCorp",
        seniority_level="senior",
        hard_skills=["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
        soft_skills=["Leadership", "Communication"],
        domain_keywords=["REST API", "Microservices"],
        ats_bait=["Python", "FastAPI", "PostgreSQL"],
        requirements_summary="Senior Python developer for API platform",
    )


def _mock_jd_weak_match():
    return JDStructured(
        title="ML Engineer",
        company="AI Startup",
        seniority_level="mid",
        hard_skills=["PyTorch", "TensorFlow", "CUDA", "MLOps", "Kubernetes"],
        soft_skills=["Research", "Publication"],
        domain_keywords=["Deep Learning", "Computer Vision"],
        ats_bait=["PyTorch", "TensorFlow", "CUDA"],
        requirements_summary="ML engineer for computer vision",
    )


def _mock_resume_strong():
    return ResumeStructured(
        name="Senior Dev",
        skills=["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Redis"],
        experience=[
            ExperienceBullet(
                role="Senior Python Developer",
                company="BigTech",
                duration="2020-2024",
                bullets=[
                    "Built REST APIs with FastAPI serving 10M requests/day",
                    "Designed PostgreSQL schema for 500M row table",
                    "Deployed microservices on AWS ECS with Docker",
                    "Led team of 4 engineers",
                ],
            )
        ],
    )


def _mock_resume_weak():
    return ResumeStructured(
        name="Junior Dev",
        skills=["JavaScript", "React", "Node.js", "MongoDB"],
        experience=[
            ExperienceBullet(
                role="Frontend Developer",
                company="Startup",
                duration="2023-2024",
                bullets=[
                    "Built React components for e-commerce site",
                    "Integrated REST APIs using Axios",
                ],
            )
        ],
    )


def _mock_gap_strong():
    return GapAnalysis(
        overall_match=0.92,
        gaps=[
            GapItem(requirement="Python", category="hard_skill", status=MatchStatus.MATCHED, similarity_score=0.95),
            GapItem(requirement="FastAPI", category="hard_skill", status=MatchStatus.MATCHED, similarity_score=0.90),
            GapItem(requirement="PostgreSQL", category="hard_skill", status=MatchStatus.MATCHED, similarity_score=0.88),
            GapItem(requirement="Docker", category="hard_skill", status=MatchStatus.MATCHED, similarity_score=0.85),
            GapItem(requirement="AWS", category="hard_skill", status=MatchStatus.MATCHED, similarity_score=0.82),
        ],
        matched_count=5,
        partial_count=0,
        missing_count=0,
        total_requirements=5,
    )


def _mock_gap_weak():
    return GapAnalysis(
        overall_match=0.15,
        gaps=[
            GapItem(requirement="PyTorch", category="hard_skill", status=MatchStatus.MISSING, similarity_score=0.05),
            GapItem(requirement="TensorFlow", category="hard_skill", status=MatchStatus.MISSING, similarity_score=0.03),
            GapItem(requirement="CUDA", category="hard_skill", status=MatchStatus.MISSING, similarity_score=0.02),
            GapItem(requirement="MLOps", category="hard_skill", status=MatchStatus.MISSING, similarity_score=0.08),
            GapItem(requirement="Kubernetes", category="hard_skill", status=MatchStatus.MISSING, similarity_score=0.10),
        ],
        matched_count=0,
        partial_count=0,
        missing_count=5,
        total_requirements=5,
    )


def _mock_rewrites_empty():
    return RewriteOutput(suggestions=[], hidden_experience=[])


def _mock_rewrites_many():
    return RewriteOutput(
        suggestions=[
            RewriteSuggestion(
                original_bullet="Built React components",
                suggested_rewrite="Architected React component library with TypeScript, reducing bundle size by 40% and improving accessibility scores to WCAG AA",
                target_requirement="TypeScript experience",
                impact_score=0.8,
                rationale="Demonstrates TypeScript expertise",
            )
            for _ in range(10)
        ],
        hidden_experience=["Leadership potential from mentoring"],
    )


def _mock_cover_letter_empty():
    return CoverLetterOutput(
        job_title="Test Role",
        full_letter="",
        sections=[],
        key_points_addressed=[],
        word_count=0,
        tone=Tone.PROFESSIONAL,
    )


def _mock_cover_letter_long():
    return CoverLetterOutput(
        job_title="Senior Role",
        full_letter="Dear Hiring Manager,\n\n" + "I am very excited about this role. " * 100 + "\n\nBest regards",
        sections=[
            CoverLetterSection(heading="Opening", content="I'm excited"),
            CoverLetterSection(heading="Body", content="My experience"),
            CoverLetterSection(heading="Closing", content="Looking forward"),
        ],
        key_points_addressed=["Python", "Leadership", "Architecture"],
        word_count=500,
        tone=Tone.PROFESSIONAL,
    )


def _mock_aggregated_strong():
    return PipelineOutput(
        overall_score=0.92,
        section_scores={"hard_skills": 0.95, "domain_keywords": 0.88, "soft_skills": 0.90, "ats_bait": 0.93},
        action_list=[
            ActionItem(priority=1, action="Highlight AWS certifications", impact="low", category="polish"),
        ],
        summary="Excellent match: 92%. 5/5 requirements matched.",
    )


def _mock_aggregated_weak():
    return PipelineOutput(
        overall_score=0.15,
        section_scores={"hard_skills": 0.05, "domain_keywords": 0.10, "soft_skills": 0.30, "ats_bait": 0.08},
        action_list=[
            ActionItem(priority=1, action="Learn PyTorch fundamentals", impact="high", category="add_skill"),
            ActionItem(priority=2, action="Take ML course with TensorFlow", impact="high", category="add_skill"),
            ActionItem(priority=3, action="Build portfolio project with CUDA", impact="medium", category="add_skill"),
            ActionItem(priority=4, action="Get Kubernetes certification", impact="medium", category="add_skill"),
            ActionItem(priority=5, action="Contribute to open source ML projects", impact="low", category="add_experience"),
        ],
        summary="Weak match: 15%. 0/5 requirements matched. Major skill gaps.",
    )


MOCK_PIPELINES = {
    "strong_match": {
        "jd": _mock_jd_strong_match,
        "resume": _mock_resume_strong,
        "gap": _mock_gap_strong,
        "rewrites": _mock_rewrites_empty,
        "cover_letter": _mock_cover_letter_long,
        "aggregated": _mock_aggregated_strong,
    },
    "weak_match": {
        "jd": _mock_jd_weak_match,
        "resume": _mock_resume_weak,
        "gap": _mock_gap_weak,
        "rewrites": _mock_rewrites_many,
        "cover_letter": _mock_cover_letter_empty,
        "aggregated": _mock_aggregated_weak,
    },
}


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()
    yield
    import os
    from db.sqlite_store import DB_PATH
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)


def _patch_pipeline(scenario):
    mocks = MOCK_PIPELINES[scenario]
    return (
        patch("pipeline.parse_jd", side_effect=lambda *a, **k: mocks["jd"]()),
        patch("pipeline.parse_resume", side_effect=lambda *a, **k: mocks["resume"]()),
        patch("pipeline.analyze_gaps", side_effect=lambda *a, **k: mocks["gap"]()),
        patch("pipeline.suggest_rewrites", side_effect=lambda *a, **k: mocks["rewrites"]()),
        patch("pipeline.generate_cover_letter", side_effect=lambda *a, **k: mocks["cover_letter"]()),
        patch("pipeline.aggregate_scores", side_effect=lambda *a, **k: mocks["aggregated"]()),
    )


# ─────────────────────────────────────────────────────────
# STRONG MATCH - response quality
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_strong_match_score_range():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "Senior Python Developer at TechCorp",
                "resume_text": "Python developer with FastAPI experience",
            })
    data = response.json()
    assert 0.8 <= data["overall_score"] <= 1.0


@pytest.mark.anyio
async def test_strong_match_all_requirements_met():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    gap = data["gap_analysis"]
    assert gap["missing_count"] == 0
    assert gap["matched_count"] == gap["total_requirements"]


@pytest.mark.anyio
async def test_strong_match_has_action_items():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    assert len(data["action_list"]) >= 1
    for action in data["action_list"]:
        assert "priority" in action
        assert "action" in action
        assert "impact" in action


@pytest.mark.anyio
async def test_strong_match_cover_letter_has_content():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    cl = data["cover_letter"]
    assert len(cl["full_letter"]) > 100
    assert cl["word_count"] > 50
    assert len(cl["sections"]) >= 2
    assert len(cl["key_points_addressed"]) >= 1


@pytest.mark.anyio
async def test_strong_match_section_scores_are_proportional():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    scores = data["section_scores"]
    for key, score in scores.items():
        assert 0 <= score <= 1, f"Section {key} score {score} out of range"
    # Strong match should have high scores across the board
    assert all(s > 0.8 for s in scores.values())


# ─────────────────────────────────────────────────────────
# WEAK MATCH - response quality
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_weak_match_score_range():
    patches = _patch_pipeline("weak_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "ML Engineer at AI Startup",
                "resume_text": "Frontend developer",
            })
    data = response.json()
    assert 0.0 <= data["overall_score"] <= 0.3


@pytest.mark.anyio
async def test_weak_match_has_gaps():
    patches = _patch_pipeline("weak_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    gap = data["gap_analysis"]
    assert gap["missing_count"] > 0
    assert gap["matched_count"] == 0


@pytest.mark.anyio
async def test_weak_match_has_many_action_items():
    patches = _patch_pipeline("weak_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    assert len(data["action_list"]) >= 3


@pytest.mark.anyio
async def test_weak_match_rewrite_suggestions_exist():
    patches = _patch_pipeline("weak_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    assert len(data["rewrite_suggestions"]["suggestions"]) >= 1


@pytest.mark.anyio
async def test_weak_match_section_scores_are_low():
    patches = _patch_pipeline("weak_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    scores = data["section_scores"]
    # Weak match should have low skill scores
    assert scores["hard_skills"] < 0.2
    assert scores["ats_bait"] < 0.2


# ─────────────────────────────────────────────────────────
# RESPONSE INTEGRITY - field presence and types
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_response_all_fields_present():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    required_fields = [
        "run_id", "overall_score", "section_scores", "gap_analysis",
        "rewrite_suggestions", "cover_letter", "action_list", "timings", "errors"
    ]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"


@pytest.mark.anyio
async def test_response_types_correct():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    data = response.json()
    assert isinstance(data["run_id"], int)
    assert isinstance(data["overall_score"], (int, float))
    assert isinstance(data["section_scores"], dict)
    assert isinstance(data["gap_analysis"], dict)
    assert isinstance(data["rewrite_suggestions"], dict)
    assert isinstance(data["cover_letter"], dict)
    assert isinstance(data["action_list"], list)
    assert isinstance(data["timings"], dict)


@pytest.mark.anyio
async def test_gap_analysis_subfields():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    gap = response.json()["gap_analysis"]
    assert "overall_match" in gap
    assert "gaps" in gap
    assert "matched_count" in gap
    assert "missing_count" in gap
    assert "total_requirements" in gap
    assert isinstance(gap["gaps"], list)
    for g in gap["gaps"]:
        assert "requirement" in g
        assert "status" in g
        assert "similarity_score" in g


@pytest.mark.anyio
async def test_cover_letter_subfields():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    cl = response.json()["cover_letter"]
    assert "job_title" in cl
    assert "full_letter" in cl
    assert "sections" in cl
    assert "key_points_addressed" in cl
    assert "word_count" in cl
    assert "tone" in cl


@pytest.mark.anyio
async def test_rewrite_suggestion_subfields():
    patches = _patch_pipeline("weak_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    rewrites = response.json()["rewrite_suggestions"]
    assert "suggestions" in rewrites
    for s in rewrites["suggestions"]:
        assert "original_bullet" in s
        assert "suggested_rewrite" in s
        assert "target_requirement" in s
        assert "impact_score" in s
        assert "rationale" in s


@pytest.mark.anyio
async def test_action_item_subfields():
    patches = _patch_pipeline("weak_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    for action in response.json()["action_list"]:
        assert "priority" in action
        assert "action" in action
        assert "impact" in action
        assert "category" in action


# ─────────────────────────────────────────────────────────
# TIMING - response includes valid timing data
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_timings_structure():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    timings = response.json()["timings"]
    assert "total" in timings
    assert timings["total"] > 0
    assert isinstance(timings["total"], float)


# ─────────────────────────────────────────────────────────
# HISTORY - stored data matches response
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_stored_data_matches_response():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD to store",
                "resume_text": "Resume to store",
            })
            run_id = response.json()["run_id"]

            detail = (await client.get(f"/api/history/{run_id}")).json()
            assert detail["jd_text"] == "JD to store"
            assert detail["resume_text"] == "Resume to store"
            assert detail["status"] == "completed"
            assert detail["overall_score"] is not None
            assert json.loads(detail["section_scores"]) is not None
            assert json.loads(detail["gap_analysis"]) is not None


# ─────────────────────────────────────────────────────────
# EDGE CASES - empty and boundary data
# ─────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_empty_rewrite_suggestions():
    patches = _patch_pipeline("strong_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    rewrites = response.json()["rewrite_suggestions"]
    assert rewrites["suggestions"] == []


@pytest.mark.anyio
async def test_empty_cover_letter_sections():
    patches = _patch_pipeline("weak_match")
    with patches[0], patches[1], patches[2], patches[3], patches[4], patches[5]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/analyze", data={
                "jd_text": "JD",
                "resume_text": "Resume",
            })
    cl = response.json()["cover_letter"]
    # Weak match should still have a cover letter structure
    assert "full_letter" in cl
    assert "sections" in cl
