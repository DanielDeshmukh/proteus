"""
Extended aggregator tests covering diverse gap scenarios and scoring edge cases.
"""
import pytest
from agents.aggregator import aggregate_scores, PipelineOutput, ActionItem
from agents.gap_models import GapAnalysis, GapItem, MatchStatus


def _make_gap(gaps):
    matched = sum(1 for g in gaps if g.status == MatchStatus.MATCHED)
    partial = sum(1 for g in gaps if g.status == MatchStatus.PARTIAL)
    missing = sum(1 for g in gaps if g.status == MatchStatus.MISSING)
    total = len(gaps)
    overall = (matched + partial * 0.5) / total if total else 1.0
    return GapAnalysis(
        overall_match=overall, matched_count=matched, partial_count=partial,
        missing_count=missing, total_requirements=total, gaps=gaps,
    )


def test_all_hard_skills_matched():
    gaps = [
        GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.95, category="hard_skill"),
        GapItem(requirement="Go", status=MatchStatus.MATCHED, similarity_score=0.90, category="hard_skill"),
        GapItem(requirement="PostgreSQL", status=MatchStatus.MATCHED, similarity_score=0.88, category="hard_skill"),
        GapItem(requirement="Kubernetes", status=MatchStatus.MATCHED, similarity_score=0.85, category="hard_skill"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.overall_score >= 0.85
    assert len(result.action_list) == 0
    assert result.section_scores["hard_skills"] == pytest.approx(0.895, abs=0.01)


def test_all_soft_skills_matched():
    gaps = [
        GapItem(requirement="Communication", status=MatchStatus.MATCHED, similarity_score=0.90, category="soft_skill"),
        GapItem(requirement="Leadership", status=MatchStatus.MATCHED, similarity_score=0.85, category="soft_skill"),
        GapItem(requirement="Teamwork", status=MatchStatus.MATCHED, similarity_score=0.80, category="soft_skill"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.section_scores["soft_skills"] == pytest.approx(0.85, abs=0.01)
    assert result.overall_score >= 0.7


def test_all_domain_keywords_matched():
    gaps = [
        GapItem(requirement="healthcare", status=MatchStatus.MATCHED, similarity_score=0.92, category="domain_keyword"),
        GapItem(requirement="fintech", status=MatchStatus.MATCHED, similarity_score=0.88, category="domain_keyword"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.section_scores["domain_keywords"] == pytest.approx(0.90, abs=0.01)


def test_all_ats_bait_matched():
    gaps = [
        GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.95, category="ats_bait"),
        GapItem(requirement="React", status=MatchStatus.MATCHED, similarity_score=0.90, category="ats_bait"),
        GapItem(requirement="AWS", status=MatchStatus.MATCHED, similarity_score=0.85, category="ats_bait"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.section_scores["ats_bait"] == pytest.approx(0.90, abs=0.01)


def test_mixed_categories_weighted():
    gaps = [
        GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.95, category="hard_skill"),
        GapItem(requirement="Go", status=MatchStatus.MISSING, similarity_score=0.10, category="hard_skill"),
        GapItem(requirement="Communication", status=MatchStatus.MATCHED, similarity_score=0.85, category="soft_skill"),
        GapItem(requirement="healthcare", status=MatchStatus.PARTIAL, similarity_score=0.55, category="domain_keyword"),
        GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.95, category="ats_bait"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert 0.4 < result.overall_score < 0.85
    assert result.section_scores["hard_skills"] == pytest.approx(0.525, abs=0.01)
    assert result.section_scores["soft_skills"] == pytest.approx(0.85, abs=0.01)


def test_action_items_prioritized_by_status():
    gaps = [
        GapItem(requirement="Kubernetes", status=MatchStatus.MISSING, similarity_score=0.15, category="hard_skill"),
        GapItem(requirement="Go", status=MatchStatus.MISSING, similarity_score=0.20, category="hard_skill"),
        GapItem(requirement="Terraform", status=MatchStatus.PARTIAL, similarity_score=0.55, category="ats_bait"),
        GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.95, category="hard_skill"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert len(result.action_list) == 3
    assert result.action_list[0].priority == 1
    assert result.action_list[0].category == "add_skill"
    assert result.action_list[2].category == "rewrite"


def test_action_items_capped_at_10():
    gaps = [
        GapItem(requirement=f"Skill {i}", status=MatchStatus.MISSING, similarity_score=0.1, category="hard_skill")
        for i in range(15)
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert len(result.action_list) == 10


def test_summary_format():
    gaps = [
        GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.95, category="hard_skill"),
        GapItem(requirement="Go", status=MatchStatus.MISSING, similarity_score=0.15, category="hard_skill"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert "Overall match" in result.summary
    assert "requirements matched" in result.summary
    assert "requirements missing" in result.summary
    assert "prioritized actions" in result.summary


def test_empty_gaps_perfect_score():
    result = aggregate_scores(_make_gap([]))
    assert result.overall_score == 1.0
    assert result.section_scores["hard_skills"] == 1.0
    assert result.section_scores["soft_skills"] == 1.0
    assert result.section_scores["domain_keywords"] == 1.0
    assert result.section_scores["ats_bait"] == 1.0
    assert len(result.action_list) == 0


def test_single_matched_gap():
    gaps = [GapItem(requirement="Python", status=MatchStatus.MATCHED, similarity_score=0.90, category="hard_skill")]
    result = aggregate_scores(_make_gap(gaps))
    # Weighted: 0.9*0.4 + 1.0*0.15 + 1.0*0.2 + 1.0*0.25 = 0.96
    assert result.overall_score == pytest.approx(0.96, abs=0.01)
    assert len(result.action_list) == 0


def test_single_missing_gap():
    gaps = [GapItem(requirement="Rust", status=MatchStatus.MISSING, similarity_score=0.10, category="hard_skill")]
    result = aggregate_scores(_make_gap(gaps))
    # Weighted: 0.1*0.4 + 1.0*0.15 + 1.0*0.2 + 1.0*0.25 = 0.64
    assert result.overall_score == pytest.approx(0.64, abs=0.01)
    assert len(result.action_list) == 1
    assert result.action_list[0].impact == "High — currently missing from resume"


def test_boundary_similarity_scores():
    gaps = [
        GapItem(requirement="A", status=MatchStatus.MATCHED, similarity_score=1.0, category="hard_skill"),
        GapItem(requirement="B", status=MatchStatus.MATCHED, similarity_score=0.0, category="hard_skill"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert 0 <= result.overall_score <= 1


def test_only_soft_skills_in_jd():
    gaps = [
        GapItem(requirement="Communication", status=MatchStatus.MATCHED, similarity_score=0.90, category="soft_skill"),
        GapItem(requirement="Leadership", status=MatchStatus.PARTIAL, similarity_score=0.55, category="soft_skill"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.section_scores["hard_skills"] == 1.0
    assert result.section_scores["soft_skills"] == pytest.approx(0.725, abs=0.01)


def test_rewrite_action_category_for_partial_domain_gap():
    gaps = [
        GapItem(requirement="HIPAA", status=MatchStatus.PARTIAL, similarity_score=0.50, category="domain_keyword"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.action_list[0].category == "rewrite"


def test_surface_experience_for_missing_domain_gap():
    gaps = [
        GapItem(requirement="HIPAA", status=MatchStatus.MISSING, similarity_score=0.10, category="domain_keyword"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.action_list[0].category == "surface_experience"


def test_add_skill_for_ats_gap():
    gaps = [
        GapItem(requirement="Kubernetes", status=MatchStatus.MISSING, similarity_score=0.10, category="ats_bait"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.action_list[0].category == "add_skill"


def test_surface_experience_for_domain_missing():
    gaps = [
        GapItem(requirement="PCI-DSS", status=MatchStatus.MISSING, similarity_score=0.05, category="domain_keyword"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert result.action_list[0].category == "surface_experience"


def test_weighted_score_calculation():
    gaps = [
        GapItem(requirement="A", status=MatchStatus.MATCHED, similarity_score=1.0, category="hard_skill"),
        GapItem(requirement="B", status=MatchStatus.MATCHED, similarity_score=1.0, category="soft_skill"),
        GapItem(requirement="C", status=MatchStatus.MATCHED, similarity_score=1.0, category="domain_keyword"),
        GapItem(requirement="D", status=MatchStatus.MATCHED, similarity_score=1.0, category="ats_bait"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    expected = 1.0 * 0.4 + 1.0 * 0.15 + 1.0 * 0.2 + 1.0 * 0.25
    assert result.overall_score == pytest.approx(expected, abs=0.01)


def test_action_item_impact_text():
    gaps = [
        GapItem(requirement="Docker", status=MatchStatus.MISSING, similarity_score=0.15, category="hard_skill"),
        GapItem(requirement="Terraform", status=MatchStatus.PARTIAL, similarity_score=0.55, category="hard_skill"),
    ]
    result = aggregate_scores(_make_gap(gaps))
    assert "High" in result.action_list[0].impact
    assert "Medium" in result.action_list[1].impact
