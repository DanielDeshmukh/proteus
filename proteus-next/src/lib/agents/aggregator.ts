import type { GapAnalysis, PipelineOutput } from "../../types";

export function aggregateScores(gapAnalysis: GapAnalysis): PipelineOutput {
  const categories = ["hard_skill", "soft_skill", "domain_keyword", "ats_bait"] as const;
  const categoryMap: Record<string, { matched: number; partial: number; total: number }> = {};

  for (const cat of categories) {
    categoryMap[cat] = { matched: 0, partial: 0, total: 0 };
  }

  for (const gap of gapAnalysis.gaps) {
    const bucket = categoryMap[gap.category];
    if (!bucket) continue;
    bucket.total++;
    if (gap.status === "matched") bucket.matched++;
    else if (gap.status === "partial") bucket.partial++;
  }

  const sectionScores: Record<string, number> = {};
  for (const [cat, label] of [["hard_skill", "hard_skills"], ["soft_skill", "soft_skills"], ["domain_keyword", "domain_keywords"], ["ats_bait", "ats_bait"]] as const) {
    const b = categoryMap[cat];
    if (b.total === 0) {
      sectionScores[label] = 1.0;
    } else {
      sectionScores[label] = Math.round(((b.matched * 1.0 + b.partial * 0.6) / b.total) * 10000) / 10000;
    }
  }

  const weights: Record<string, number> = {
    hard_skills: 0.5,
    soft_skills: 0.15,
    domain_keywords: 0.2,
    ats_bait: 0.15,
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
