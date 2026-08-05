import type { GapAnalysis, PipelineOutput } from "../../types";

export function aggregateScores(gapAnalysis: GapAnalysis): PipelineOutput {
  const hardSkillScores: number[] = [];
  const softSkillScores: number[] = [];
  const domainScores: number[] = [];
  const atsScores: number[] = [];

  for (const gap of gapAnalysis.gaps) {
    switch (gap.category) {
      case "hard_skill":
        hardSkillScores.push(gap.similarity_score);
        break;
      case "soft_skill":
        softSkillScores.push(gap.similarity_score);
        break;
      case "domain_keyword":
        domainScores.push(gap.similarity_score);
        break;
      case "ats_bait":
        atsScores.push(gap.similarity_score);
        break;
    }
  }

  const avg = (scores: number[]): number => {
    if (scores.length === 0) return 1.0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10000) / 10000;
  };

  const sectionScores: Record<string, number> = {
    hard_skills: avg(hardSkillScores),
    soft_skills: avg(softSkillScores),
    domain_keywords: avg(domainScores),
    ats_bait: avg(atsScores),
  };

  const weights: Record<string, number> = {
    hard_skills: 0.4,
    soft_skills: 0.15,
    domain_keywords: 0.2,
    ats_bait: 0.25,
  };

  let overallScore = 0;
  for (const key of Object.keys(weights)) {
    overallScore += sectionScores[key] * weights[key];
  }
  overallScore = Math.round(overallScore * 10000) / 10000;

  const matchedPct = gapAnalysis.total_requirements
    ? (gapAnalysis.matched_count / gapAnalysis.total_requirements) * 100
    : 100;
  const missingPct = gapAnalysis.total_requirements
    ? (gapAnalysis.missing_count / gapAnalysis.total_requirements) * 100
    : 0;

  const summary =
    `Overall match: ${Math.round(overallScore * 100)}%. ` +
    `${gapAnalysis.matched_count}/${gapAnalysis.total_requirements} requirements matched (${Math.round(matchedPct)}%). ` +
    `${gapAnalysis.missing_count} requirements missing (${Math.round(missingPct)}%).`;

  return {
    overall_score: overallScore,
    section_scores: sectionScores,
    summary,
  };
}
