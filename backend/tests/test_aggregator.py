import pytest
from agents.aggregator import aggregate_scores, PipelineOutput, ActionItem
from agents.gap_models import GapAnalysis, GapItem, MatchStatus


def _make_gap_analysis(gaps: list[GapItem]) -> GapAnalysis:
    matched = sum(1 for g in gaps if g.status == MatchStatus.MATCHED)
    partial = sum(1 for g in gaps if g.status == MatchStatus.PARTIAL)
    missing = sum(1 for g in gaps if g.status == MatchStatus.MISSING)
    total = len(gaps)
    overall = (matched + partial * 0.5) / total if total else 1.0
    return GapAnalysis(
        overall_match=overall,
        matched_count=matched,
        partial_count=partial,
        missing_count=missing,
        total_requirements=total,
        gaps=gaps,
    )


def test_aggregate_all_matched():
    gaps = [
        GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.95, category="hard_skill"),
        GapItem(requirement="PostgreSQL", status=MatchStatus.MATCHED, similarity_score=0.88, category="hard_skill"),
        GapItem(requirement="Communication", status=MatchStatus.MATCHED, similarity_score=0.80, category="soft_skill"),
    ]
    analysis = _make_gap_analysis(gaps)
    result = aggregate_scores(analysis)
    assert result.overall_score >= 0.8
    assert len(result.action_list) == 0
    assert "matched" in result.summary.lower()


def test_aggregate_all_missing():
    gaps = [
        GapItem(requirement="Kubernetes", status=MatchStatus.MISSING, similarity_score=0.2, category="hard_skill"),
        GapItem(requirement="Terraform", status=MatchStatus.MISSING, similarity_score=0.15, category="ats_bait"),
    ]
    analysis = _make_gap_analysis(gaps)
    result = aggregate_scores(analysis)
    assert result.overall_score < 0.5
    assert len(result.action_list) == 2
    assert result.action_list[0].priority == 1


def test_aggregate_mixed():
    gaps = [
        GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.92, category="hard_skill"),
        GapItem(requirement="Go", status=MatchStatus.PARTIAL, similarity_score=0.55, category="hard_skill"),
        GapItem(requirement="Kubernetes", status=MatchStatus.MISSING, similarity_score=0.25, category="hard_skill"),
        GapItem(requirement="Teamwork", status=MatchStatus.MATCHED, similarity_score=0.85, category="soft_skill"),
    ]
    analysis = _make_gap_analysis(gaps)
    result = aggregate_scores(analysis)
    assert 0.3 < result.overall_score < 0.9
    assert result.section_scores["hard_skills"] < 1.0
    assert result.section_scores["soft_skills"] == 0.85


def test_aggregate_empty_gaps():
    analysis = _make_gap_analysis([])
    result = aggregate_scores(analysis)
    assert result.overall_score == 1.0
    assert len(result.action_list) == 0


def test_action_item_model():
    action = ActionItem(
        priority=1,
        action="Add Kubernetes experience",
        impact="High — currently missing",
        category="add_skill",
    )
    assert action.priority == 1
    assert action.category == "add_skill"


def test_pipeline_output_model():
    output = PipelineOutput(
        overall_score=0.75,
        section_scores={"hard_skills": 0.8, "soft_skills": 0.7},
        action_list=[],
        summary="Good match",
    )
    assert output.overall_score == 0.75
    assert "hard_skills" in output.section_scores
