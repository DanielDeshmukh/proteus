import pytest
import math
from agents.gap_models import GapItem, GapAnalysis, MatchStatus
from agents.gap_analyzer import cosine_similarity, _build_resume_evidence, analyze_gaps
from agents.jd_models import JDStructured
from agents.resume_models import ResumeStructured


def test_cosine_similarity_identical():
    vec = [1.0, 2.0, 3.0]
    assert cosine_similarity(vec, vec) == pytest.approx(1.0)


def test_cosine_similarity_orthogonal():
    a = [1.0, 0.0]
    b = [0.0, 1.0]
    assert cosine_similarity(a, b) == pytest.approx(0.0)


def test_cosine_similarity_opposite():
    a = [1.0, 0.0]
    b = [-1.0, 0.0]
    assert cosine_similarity(a, b) == pytest.approx(-1.0)


def test_cosine_similarity_zero_vector():
    assert cosine_similarity([0.0, 0.0], [1.0, 2.0]) == 0.0


def test_build_resume_evidence():
    resume = ResumeStructured(
        name="Test",
        skills=["Python", "Go"],
        experience=[
            {
                "role": "Engineer",
                "company": "Corp",
                "bullets": ["Built APIs", "Led team"],
            }
        ],
        projects=[
            {
                "name": "Proj",
                "description": "A cool project",
                "technologies": ["React", "Node"],
            }
        ],
        education=[],
        certifications=[],
    )
    evidence = _build_resume_evidence(resume)
    assert "Python" in evidence
    assert "Go" in evidence
    assert "Built APIs" in evidence
    assert "Led team" in evidence
    assert "Proj: A cool project (React, Node)" in evidence


def test_gap_model_valid():
    gap = GapItem(
        requirement="Python",
        status=MatchStatus.MATCHED,
        similarity_score=0.95,
        matched_evidence="5 years Python experience",
        category="hard_skill",
    )
    assert gap.requirement == "Python"
    assert gap.status == MatchStatus.MATCHED


def test_gap_analysis_model():
    analysis = GapAnalysis(
        overall_match=0.75,
        matched_count=6,
        partial_count=2,
        missing_count=2,
        total_requirements=10,
        gaps=[],
    )
    assert analysis.overall_match == 0.75
    assert analysis.matched_count == 6


def test_analyze_gaps_no_requirements():
    jd = JDStructured(
        title="Test",
        seniority_level="mid",
        hard_skills=[],
        soft_skills=[],
        domain_keywords=[],
        ats_bait=[],
        requirements_summary="Test role",
    )
    resume = ResumeStructured(
        name="Test",
        skills=["Python"],
        experience=[],
        projects=[],
        education=[],
        certifications=[],
    )
    result = analyze_gaps(jd, resume)
    assert result.overall_match == 1.0
    assert result.total_requirements == 0
