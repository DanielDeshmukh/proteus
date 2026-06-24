from pydantic import BaseModel, Field

from agents.gap_models import GapAnalysis, MatchStatus


class ActionItem(BaseModel):
    priority: int = Field(description="Priority rank (1 = highest)")
    action: str = Field(description="Specific action to take")
    impact: str = Field(description="Expected impact on match score")
    category: str = Field(description="Category: rewrite, add_skill, surface_experience")


class PipelineOutput(BaseModel):
    overall_score: float = Field(description="Overall match score (0.0 to 1.0)")
    section_scores: dict[str, float] = Field(description="Score breakdown by category")
    action_list: list[ActionItem] = Field(description="Prioritized action items")
    summary: str = Field(description="Human-readable summary of the analysis")


def aggregate_scores(gap_analysis: GapAnalysis) -> PipelineOutput:
    hard_skill_scores = []
    soft_skill_scores = []
    domain_scores = []
    ats_scores = []

    for gap in gap_analysis.gaps:
        if gap.category == "hard_skill":
            hard_skill_scores.append(gap.similarity_score)
        elif gap.category == "soft_skill":
            soft_skill_scores.append(gap.similarity_score)
        elif gap.category == "domain_keyword":
            domain_scores.append(gap.similarity_score)
        elif gap.category == "ats_bait":
            ats_scores.append(gap.similarity_score)

    def avg(scores: list[float]) -> float:
        return round(sum(scores) / len(scores), 4) if scores else 1.0

    section_scores = {
        "hard_skills": avg(hard_skill_scores),
        "soft_skills": avg(soft_skill_scores),
        "domain_keywords": avg(domain_scores),
        "ats_bait": avg(ats_scores),
    }

    weights = {"hard_skills": 0.4, "soft_skills": 0.15, "domain_keywords": 0.2, "ats_bait": 0.25}
    overall_score = round(
        sum(section_scores[k] * weights[k] for k in weights),
        4,
    )

    actions: list[ActionItem] = []
    priority = 1
    for gap in gap_analysis.gaps:
        if gap.status == MatchStatus.MISSING:
            actions.append(
                ActionItem(
                    priority=priority,
                    action=f"Add or surface experience for: {gap.requirement}",
                    impact="High — currently missing from resume",
                    category="add_skill" if gap.category in ("hard_skill", "ats_bait") else "surface_experience",
                )
            )
            priority += 1
        elif gap.status == MatchStatus.PARTIAL:
            actions.append(
                ActionItem(
                    priority=priority,
                    action=f"Strengthen mention of: {gap.requirement}",
                    impact=f"Medium — partially matched (score: {gap.similarity_score:.0%})",
                    category="rewrite",
                )
            )
            priority += 1

    actions = actions[:10]

    matched_pct = gap_analysis.matched_count / gap_analysis.total_requirements * 100 if gap_analysis.total_requirements else 100
    missing_pct = gap_analysis.missing_count / gap_analysis.total_requirements * 100 if gap_analysis.total_requirements else 0

    summary = (
        f"Overall match: {overall_score:.0%}. "
        f"{gap_analysis.matched_count}/{gap_analysis.total_requirements} requirements matched ({matched_pct:.0f}%). "
        f"{gap_analysis.missing_count} requirements missing ({missing_pct:.0f}%). "
        f"{len(actions)} prioritized actions generated."
    )

    return PipelineOutput(
        overall_score=overall_score,
        section_scores=section_scores,
        action_list=actions,
        summary=summary,
    )
