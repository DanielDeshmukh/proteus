import pytest
from agents.rewrite_models import RewriteSuggestion, RewriteOutput
from agents.rewrite_suggester import suggest_rewrites
from agents.gap_models import GapAnalysis, GapItem, MatchStatus
from agents.jd_models import JDStructured
from agents.resume_models import ResumeStructured


def test_rewrite_model_valid():
    suggestion = RewriteSuggestion(
        original_bullet="Built APIs",
        suggested_rewrite="Designed and deployed RESTful APIs serving 10K+ requests/sec using Python and FastAPI",
        rationale="Added specific technologies and metrics from JD",
        target_requirement="Python, REST APIs, FastAPI",
        impact_score=0.85,
        experience_context="Backend Engineer at TechCorp",
    )
    assert suggestion.impact_score == 0.85
    assert "FastAPI" in suggestion.suggested_rewrite


def test_rewrite_output_model():
    output = RewriteOutput(
        suggestions=[
            RewriteSuggestion(
                original_bullet="Did stuff",
                suggested_rewrite="Improved system performance by 40% through PostgreSQL query optimization",
                rationale="Added metrics and specific technology",
                target_requirement="PostgreSQL",
                impact_score=0.9,
            )
        ],
        hidden_experience=["Has Kubernetes experience not mentioned in resume"],
    )
    assert len(output.suggestions) == 1
    assert len(output.hidden_experience) == 1


def test_rewrite_output_empty():
    output = RewriteOutput(suggestions=[], hidden_experience=[])
    assert len(output.suggestions) == 0


def test_suggest_rewrites_no_gaps():
    jd = JDStructured(
        title="Engineer",
        seniority_level="mid",
        hard_skills=["Python"],
        soft_skills=[],
        domain_keywords=[],
        ats_bait=["Python"],
        requirements_summary="Python engineer",
    )
    resume = ResumeStructured(
        name="Test",
        skills=["Python"],
        experience=[],
        projects=[],
        education=[],
        certifications=[],
    )
    gap_analysis = GapAnalysis(
        overall_match=1.0,
        matched_count=1,
        partial_count=0,
        missing_count=0,
        total_requirements=1,
        gaps=[
            GapItem(
                requirement="Python",
                status=MatchStatus.MATCHED,
                similarity_score=0.95,
                matched_evidence="5 years Python",
                category="hard_skill",
            )
        ],
    )
    result = suggest_rewrites(jd, resume, gap_analysis)
    assert len(result.suggestions) == 0


def test_rewrite_impact_sorting():
    suggestions = [
        RewriteSuggestion(
            original_bullet="A",
            suggested_rewrite="B",
            rationale="r",
            target_requirement="t",
            impact_score=0.3,
        ),
        RewriteSuggestion(
            original_bullet="X",
            suggested_rewrite="Y",
            rationale="r",
            target_requirement="t",
            impact_score=0.9,
        ),
        RewriteSuggestion(
            original_bullet="M",
            suggested_rewrite="N",
            rationale="r",
            target_requirement="t",
            impact_score=0.6,
        ),
    ]
    output = RewriteOutput(suggestions=suggestions)
    output.suggestions.sort(key=lambda s: s.impact_score, reverse=True)
    assert output.suggestions[0].impact_score == 0.9
    assert output.suggestions[1].impact_score == 0.6
    assert output.suggestions[2].impact_score == 0.3
