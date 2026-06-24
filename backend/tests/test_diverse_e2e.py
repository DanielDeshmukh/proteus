"""
Comprehensive E2E tests for diverse JD + Resume combinations.
Tests the full pipeline with mocked NIM calls across industries, seniority levels, and match qualities.
"""
from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient

from agents.aggregator import ActionItem, PipelineOutput
from agents.cover_letter_models import CoverLetterOutput, CoverLetterSection, Tone
from agents.gap_models import GapAnalysis, GapItem, MatchStatus
from agents.jd_models import JDStructured
from agents.resume_models import ResumeStructured
from agents.rewrite_models import RewriteOutput, RewriteSuggestion
from db.sqlite_store import init_db
from main import app
from tests.fixtures.diverse_jds import (
    AI_ML_ENGINEER_JD,
    DATA_ENGINEER_JD,
    DEVOPS_SRE_JD,
    GAME_DEVELOPER_JD,
    HEALTHCARE_DATA_SCIENTIST_JD,
    JUNIOR_FRONTEND_JD,
    MOBILE_DEV_JD,
    PRODUCT_MANAGER_JD,
    QUANTITATIVE_ANALYST_JD,
    SECURITY_ENGINEER_JD,
    UX_DESIGNER_JD,
    VP_ENGINEERING_JD,
)
from tests.fixtures.diverse_resumes import (
    AI_ML_JUNIOR_RESUME,
    DATA_ENG_JUNIOR_RESUME,
    GAME_DEV_RESUME,
    HEALTHCARE_DS_RESUME,
    JUNIOR_FRONTEND_RESUME,
    MOBILE_DEV_RESUME,
    PM_CAREER_CHANGER_RESUME,
    QUANT_JUNIOR_RESUME,
    SECURITY_RESUME,
    SRE_RESUME,
    UX_DESIGNER_RESUME,
    VP_ENG_RESUME,
)
from tests.fixtures.edge_cases import (
    CAREER_CHANGER_RESUME,
    LONG_JD,
    MINIMAL_JD,
    MINIMAL_RESUME,
    OVERQUALIFIED_RESUME,
    PARAGRAPH_JD,
    RESUME_WITH_GAPS,
)


def _mock_jd(title="Software Engineer", company="TechCorp", seniority="mid",
             hard=None, soft=None, domain=None, ats=None):
    return JDStructured(
        title=title, company=company, seniority_level=seniority,
        hard_skills=hard or ["Python", "PostgreSQL"],
        soft_skills=soft or ["Communication"],
        domain_keywords=domain or ["software"],
        ats_bait=ats or ["Python"],
        requirements_summary=f"Looking for a {seniority} {title}",
    )


def _mock_resume(name="Test Candidate", skills=None):
    return ResumeStructured(
        name=name, skills=skills or ["Python"],
        experience=[], projects=[], education=[], certifications=[],
    )


def _mock_gap(overall=0.65, matched=2, partial=1, missing=2, total=5):
    return GapAnalysis(
        overall_match=overall, matched_count=matched, partial_count=partial,
        missing_count=missing, total_requirements=total,
        gaps=[
            GapItem(requirement="Skill A", status=MatchStatus.MATCHED, similarity_score=0.85, category="hard_skill"),
            GapItem(requirement="Skill B", status=MatchStatus.MATCHED, similarity_score=0.80, category="hard_skill"),
            GapItem(requirement="Skill C", status=MatchStatus.PARTIAL, similarity_score=0.55, category="soft_skill"),
            GapItem(requirement="Skill D", status=MatchStatus.MISSING, similarity_score=0.25, category="hard_skill"),
            GapItem(requirement="Skill E", status=MatchStatus.MISSING, similarity_score=0.15, category="ats_bait"),
        ],
    )


def _mock_rewrites(count=2):
    suggestions = [
        RewriteSuggestion(
            original_bullet=f"Original bullet {i}",
            suggested_rewrite=f"Improved bullet {i} with metrics",
            rationale=f"Addresses gap {i}", target_requirement=f"Req {i}",
            impact_score=round(0.9 - i * 0.2, 2),
        ) for i in range(count)
    ]
    return RewriteOutput(suggestions=suggestions, hidden_experience=["Hidden skill"])


def _mock_cover(tone=Tone.PROFESSIONAL):
    return CoverLetterOutput(
        job_title="Software Engineer",
        full_letter="Dear Hiring Team,\n\nI am excited to apply...",
        sections=[CoverLetterSection(heading="Opening", content="I am excited...")],
        key_points_addressed=["Python"], word_count=200, tone=tone,
    )


def _mock_agg(score=0.65, num_actions=1):
    actions = [
        ActionItem(priority=i+1, action=f"Action {i+1}", impact="High" if i == 0 else "Medium", category="add_skill")
        for i in range(num_actions)
    ]
    return PipelineOutput(
        overall_score=score,
        section_scores={"hard_skills": 0.7, "soft_skills": 0.6, "domain_keywords": 0.5, "ats_bait": 0.7},
        action_list=actions,
        summary=f"Overall match: {score:.0%}",
    )


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()
    yield
    import os

    from db.sqlite_store import DB_PATH
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)


def _patch_all():
    return (
        patch("pipeline.parse_jd"), patch("pipeline.parse_resume"),
        patch("pipeline.analyze_gaps"), patch("pipeline.suggest_rewrites"),
        patch("pipeline.generate_cover_letter"), patch("pipeline.aggregate_scores"),
    )


@pytest.mark.anyio
async def test_e2e_healthcare_ds():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Data Scientist", "MedCore", "mid",
            hard=["Python", "TensorFlow", "SQL"], domain=["healthcare", "EHR"], ats=["Python", "TensorFlow"])
        mres.return_value = _mock_resume("Priya Sharma",
            skills=["Python", "TensorFlow", "scikit-learn", "SQL", "Tableau"])
        mgap.return_value = _mock_gap(0.78, 4, 1, 1, 6)
        mrw.return_value = _mock_rewrites(1)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.78)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": HEALTHCARE_DATA_SCIENTIST_JD, "resume_text": HEALTHCARE_DS_RESUME})
            assert r.status_code == 200
            d = r.json()
            assert 0 <= d["overall_score"] <= 1
            assert d["gap_analysis"]["total_requirements"] == 6


@pytest.mark.anyio
async def test_e2e_game_dev():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Game Programmer", "PixelForge", "senior",
            hard=["C++", "Unreal Engine 5", "linear algebra"], domain=["game", "rendering"], ats=["C++", "Unreal"])
        mres.return_value = _mock_resume("Marcus Johnson", skills=["C#", "C++", "Unity", "Unreal"])
        mgap.return_value = _mock_gap(0.52, 1, 2, 2, 5)
        mrw.return_value = _mock_rewrites(2)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.52)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": GAME_DEVELOPER_JD, "resume_text": GAME_DEV_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] < 0.7


@pytest.mark.anyio
async def test_e2e_sre_strong_match():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("SRE", "CloudScale", "senior",
            hard=["Kubernetes", "Terraform", "Python", "Go", "Prometheus"], ats=["Kubernetes", "Terraform"])
        mres.return_value = _mock_resume("Sarah Chen",
            skills=["Kubernetes", "Terraform", "Python", "Go", "Prometheus", "Grafana"])
        mgap.return_value = _mock_gap(0.88, 5, 1, 0, 6)
        mrw.return_value = _mock_rewrites(0)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.88)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": DEVOPS_SRE_JD, "resume_text": SRE_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] >= 0.8


@pytest.mark.anyio
async def test_e2e_ml_junior_underqualified():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("ML Engineer", "LinguaAI", "mid",
            hard=["PyTorch", "transformers", "model serving"], domain=["NLP", "LLM"], ats=["PyTorch", "BERT"])
        mres.return_value = _mock_resume("Alex Park", skills=["PyTorch", "scikit-learn", "Hugging Face"])
        mgap.return_value = _mock_gap(0.45, 1, 2, 3, 6)
        mrw.return_value = _mock_rewrites(3)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.45, num_actions=3)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": AI_ML_ENGINEER_JD, "resume_text": AI_ML_JUNIOR_RESUME})
            assert r.status_code == 200
            d = r.json()
            assert d["overall_score"] < 0.55
            assert len(d["action_list"]) >= 3


@pytest.mark.anyio
async def test_e2e_pm_career_changer():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Product Manager", "WorkflowIO", "senior",
            hard=["SQL", "analytics", "agile"], domain=["B2B SaaS"], ats=["SQL", "Jira"])
        mres.return_value = _mock_resume("Jessica Martinez",
            skills=["SQL", "Python", "Jira", "Figma", "Amplitude"])
        mgap.return_value = _mock_gap(0.55, 2, 2, 2, 6)
        mrw.return_value = _mock_rewrites(2)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.55)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": PRODUCT_MANAGER_JD, "resume_text": PM_CAREER_CHANGER_RESUME})
            assert r.status_code == 200
            assert 0.4 <= r.json()["overall_score"] <= 0.7


@pytest.mark.anyio
async def test_e2e_mobile_dev_strong():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("iOS Developer", "SnapFit", "mid",
            hard=["Swift", "SwiftUI", "UIKit", "HealthKit"], ats=["Swift", "SwiftUI", "HealthKit"])
        mres.return_value = _mock_resume("Alex Rivera",
            skills=["Swift", "SwiftUI", "UIKit", "HealthKit", "Core Motion", "WatchKit"])
        mgap.return_value = _mock_gap(0.85, 4, 1, 1, 6)
        mrw.return_value = _mock_rewrites(1)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.85)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": MOBILE_DEV_JD, "resume_text": MOBILE_DEV_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] >= 0.75


@pytest.mark.anyio
async def test_e2e_security_partial():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Security Engineer", "ShieldNet", "senior",
            hard=["OWASP", "SAST/DAST", "Python", "Go"], domain=["PCI-DSS"], ats=["OWASP", "Python"])
        mres.return_value = _mock_resume("Kim Nguyen",
            skills=["Python", "Go", "OWASP", "SAST/DAST", "AWS"])
        mgap.return_value = _mock_gap(0.62, 3, 1, 2, 6)
        mrw.return_value = _mock_rewrites(2)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.62)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": SECURITY_ENGINEER_JD, "resume_text": SECURITY_RESUME})
            assert r.status_code == 200
            assert 0.5 <= r.json()["overall_score"] <= 0.75


@pytest.mark.anyio
async def test_e2e_ux_designer_strong():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("UX Designer", "DesignCraft", "senior",
            hard=["Figma", "user research", "design systems"], ats=["Figma"])
        mres.return_value = _mock_resume("Emily Zhang",
            skills=["Figma", "Sketch", "user research", "design systems"])
        mgap.return_value = _mock_gap(0.82, 4, 1, 1, 6)
        mrw.return_value = _mock_rewrites(1)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.82)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": UX_DESIGNER_JD, "resume_text": UX_DESIGNER_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] >= 0.7


@pytest.mark.anyio
async def test_e2e_data_eng_junior_underqualified():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Data Engineer", "DataPipe", "senior",
            hard=["Spark", "Airflow", "dbt", "Snowflake", "Kafka"], ats=["Spark", "Airflow"])
        mres.return_value = _mock_resume("Tyler Brooks",
            skills=["Python", "SQL", "PostgreSQL", "Tableau"])
        mgap.return_value = _mock_gap(0.35, 1, 1, 4, 6)
        mrw.return_value = _mock_rewrites(4)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.35, num_actions=4)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": DATA_ENGINEER_JD, "resume_text": DATA_ENG_JUNIOR_RESUME})
            assert r.status_code == 200
            d = r.json()
            assert d["overall_score"] < 0.5
            assert len(d["action_list"]) >= 4


@pytest.mark.anyio
async def test_e2e_vp_eng_executive():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("VP Engineering", "ScaleUp", "executive",
            hard=["leadership", "architecture"], domain=["SaaS", "enterprise"], ats=["VP", "CTO"])
        mres.return_value = _mock_resume("David Kim",
            skills=["Python", "Go", "Kubernetes", "AWS", "leadership"])
        mgap.return_value = _mock_gap(0.90, 5, 1, 0, 6)
        mrw.return_value = _mock_rewrites(0)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.90)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": VP_ENGINEERING_JD, "resume_text": VP_ENG_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] >= 0.8


@pytest.mark.anyio
async def test_e2e_junior_frontend_good():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Frontend Dev", "WebCraft", "junior",
            hard=["HTML", "CSS", "JavaScript", "React"], ats=["HTML", "CSS", "React"])
        mres.return_value = _mock_resume("Mia Wilson",
            skills=["HTML", "CSS", "JavaScript", "React", "Tailwind CSS"])
        mgap.return_value = _mock_gap(0.75, 3, 1, 1, 5)
        mrw.return_value = _mock_rewrites(1)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.75)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": JUNIOR_FRONTEND_JD, "resume_text": JUNIOR_FRONTEND_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] >= 0.6


@pytest.mark.anyio
async def test_e2e_quant_underqualified():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Quant Analyst", "AlphaEdge", "mid",
            hard=["Python", "C++", "time series", "stochastic calculus"], ats=["Python", "C++", "Bloomberg"])
        mres.return_value = _mock_resume("Noah Fischer",
            skills=["Python", "R", "SQL", "pandas", "NumPy"])
        mgap.return_value = _mock_gap(0.38, 1, 2, 3, 6)
        mrw.return_value = _mock_rewrites(3)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.38)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": QUANTITATIVE_ANALYST_JD, "resume_text": QUANT_JUNIOR_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] < 0.5


# ---- EDGE CASE TESTS ----

@pytest.mark.anyio
async def test_e2e_minimal_jd_resume():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Engineer", None, "mid", hard=["Python"], ats=["Python"])
        mres.return_value = _mock_resume("John Smith", skills=["Python", "JavaScript"])
        mgap.return_value = _mock_gap(0.80, 1, 0, 0, 1)
        mrw.return_value = _mock_rewrites(0)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.80)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": MINIMAL_JD, "resume_text": MINIMAL_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] is not None


@pytest.mark.anyio
async def test_e2e_long_jd():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Senior Engineer", "MegaCorp", "senior",
            hard=["Python", "Go", "PostgreSQL", "Redis", "Kafka", "Kubernetes"],
            domain=["distributed systems"], ats=["Python", "Go", "Kubernetes"])
        mres.return_value = _mock_resume("Test", skills=["Python", "Go", "PostgreSQL", "Redis"])
        mgap.return_value = _mock_gap(0.70, 3, 2, 1, 6)
        mrw.return_value = _mock_rewrites(1)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.70)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": LONG_JD, "resume_text": MINIMAL_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] is not None


@pytest.mark.anyio
async def test_e2e_overqualified():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Senior Backend", "NovaPay", "senior",
            hard=["Python", "Go", "PostgreSQL", "Redis", "Kafka"], ats=["Python", "Go"])
        mres.return_value = _mock_resume("Dr. Robert Chang",
            skills=["Python", "Go", "Java", "C++", "Rust", "TypeScript", "PostgreSQL", "Redis", "Kafka", "Kubernetes"])
        mgap.return_value = _mock_gap(0.95, 5, 0, 0, 5)
        mrw.return_value = _mock_rewrites(0)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.95)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": "Senior Backend Engineer needed", "resume_text": OVERQUALIFIED_RESUME})
            assert r.status_code == 200
            assert r.json()["overall_score"] >= 0.85


@pytest.mark.anyio
async def test_e2e_career_changer():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Healthcare Developer", "MedTech", "junior",
            hard=["JavaScript", "React", "SQL"], domain=["healthcare"], ats=["JavaScript", "React"])
        mres.return_value = _mock_resume("Sarah Johnson",
            skills=["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL"])
        mgap.return_value = _mock_gap(0.50, 2, 2, 2, 6)
        mrw.return_value = _mock_rewrites(2)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.50)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": HEALTHCARE_DATA_SCIENTIST_JD, "resume_text": CAREER_CHANGER_RESUME})
            assert r.status_code == 200
            assert 0.3 <= r.json()["overall_score"] <= 0.7


@pytest.mark.anyio
async def test_e2e_paragraph_jd():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Full-Stack Engineer", "Fintech Startup", "mid",
            hard=["TypeScript", "React", "Node.js", "PostgreSQL", "Stripe"],
            domain=["fintech", "payments"], ats=["TypeScript", "React", "Node.js"])
        mres.return_value = _mock_resume("Test Dev",
            skills=["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"])
        mgap.return_value = _mock_gap(0.68, 3, 1, 1, 5)
        mrw.return_value = _mock_rewrites(1)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.68)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": PARAGRAPH_JD, "resume_text": "Test resume"})
            assert r.status_code == 200
            assert r.json()["overall_score"] is not None


@pytest.mark.anyio
async def test_e2e_resume_with_employment_gaps():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Backend Dev", "CloudTech", "mid",
            hard=["Python", "Django", "PostgreSQL", "Redis"], ats=["Python", "Django"])
        mres.return_value = _mock_resume("Michael Brown",
            skills=["Python", "Django", "PostgreSQL", "Redis", "Docker"])
        mgap.return_value = _mock_gap(0.72, 3, 1, 1, 5)
        mrw.return_value = _mock_rewrites(1)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.72)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": "Backend dev needed", "resume_text": RESUME_WITH_GAPS})
            assert r.status_code == 200
            assert r.json()["overall_score"] is not None


@pytest.mark.anyio
async def test_e2e_perfect_match():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Python Dev", "TechCo", "mid",
            hard=["Python", "FastAPI", "PostgreSQL"], ats=["Python", "FastAPI"])
        mres.return_value = _mock_resume("Perfect Match",
            skills=["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kubernetes"])
        mgap.return_value = _mock_gap(0.98, 3, 0, 0, 3)
        mrw.return_value = _mock_rewrites(0)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.98)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": "Python dev", "resume_text": "Resume"})
            assert r.status_code == 200
            d = r.json()
            assert d["overall_score"] >= 0.9
            assert len(d["action_list"]) <= 1


@pytest.mark.anyio
async def test_e2e_zero_match():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Rust Engineer", "SystemsCo", "senior",
            hard=["Rust", "WebAssembly", "Linux kernel"], ats=["Rust", "WebAssembly"])
        mres.return_value = _mock_resume("Marketing Person",
            skills=["HubSpot", "Google Ads", "Copywriting", "SEO"])
        mgap.return_value = GapAnalysis(
            overall_match=0.05, matched_count=0, partial_count=0,
            missing_count=3, total_requirements=3,
            gaps=[
                GapItem(requirement="Rust", status=MatchStatus.MISSING, similarity_score=0.05, category="hard_skill"),
                GapItem(requirement="WebAssembly", status=MatchStatus.MISSING, similarity_score=0.03, category="hard_skill"),
                GapItem(requirement="Linux kernel", status=MatchStatus.MISSING, similarity_score=0.02, category="ats_bait"),
            ])
        mrw.return_value = _mock_rewrites(3)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.05, num_actions=3)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": "Rust engineer", "resume_text": "Marketing resume"})
            assert r.status_code == 200
            d = r.json()
            assert d["overall_score"] < 0.15
            assert len(d["action_list"]) >= 3


@pytest.mark.anyio
async def test_e2e_cover_letter_tone_variations():
    for tone in [Tone.PROFESSIONAL, Tone.ENTHUSIASTIC, Tone.CONCISE]:
        p = _patch_all()
        with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
            mjd.return_value = _mock_jd("Engineer", "Co", "mid")
            mres.return_value = _mock_resume("Test")
            mgap.return_value = _mock_gap(0.7, 2, 1, 0, 3)
            mrw.return_value = _mock_rewrites(0)
            mcl.return_value = _mock_cover(tone)
            magg.return_value = _mock_agg(0.7)
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                r = await c.post("/api/analyze", data={
                    "jd_text": "Engineer needed", "resume_text": "Resume",
                    "cover_letter_tone": tone.value,
                })
                assert r.status_code == 200
                assert r.json()["cover_letter"]["tone"] == tone.value


@pytest.mark.anyio
async def test_e2e_all_section_scores_present():
    p = _patch_all()
    with p[0] as mjd, p[1] as mres, p[2] as mgap, p[3] as mrw, p[4] as mcl, p[5] as magg:
        mjd.return_value = _mock_jd("Engineer", "Co", "mid")
        mres.return_value = _mock_resume("Test")
        mgap.return_value = _mock_gap(0.65, 2, 1, 2, 5)
        mrw.return_value = _mock_rewrites(2)
        mcl.return_value = _mock_cover()
        magg.return_value = _mock_agg(0.65)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            r = await c.post("/api/analyze", data={"jd_text": "JD", "resume_text": "Resume"})
            assert r.status_code == 200
            d = r.json()
            for key in ["hard_skills", "soft_skills", "domain_keywords", "ats_bait"]:
                assert key in d["section_scores"]
                assert 0 <= d["section_scores"][key] <= 1
