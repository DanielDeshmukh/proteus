import { embedTexts } from "../nim-client";
import { getModelForRole } from "../model-config";
import type { JDStructured, ResumeStructured, GapAnalysis, GapItem } from "../../types";

const EMBEDDING_MODEL = getModelForRole("gap-analyzer");
const MATCH_THRESHOLD = 0.55;
const PARTIAL_THRESHOLD = 0.35;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

function buildResumeEvidence(resume: ResumeStructured): string[] {
  const evidence: string[] = [...resume.skills];
  for (const exp of resume.experience) {
    for (const bullet of exp.bullets) {
      evidence.push(bullet);
    }
  }
  for (const proj of resume.projects) {
    evidence.push(`${proj.name}: ${proj.description} (${proj.technologies.join(", ")})`);
  }
  return evidence;
}

export async function analyzeGaps(
  jd: JDStructured,
  resume: ResumeStructured
): Promise<GapAnalysis> {
  const requirements: Array<[string, string]> = [];
  const seen = new Set<string>();
  for (const skill of jd.hard_skills) {
    const key = skill.toLowerCase().trim();
    if (!seen.has(key)) { seen.add(key); requirements.push([skill, "hard_skill"]); }
  }
  for (const skill of jd.soft_skills) {
    const key = skill.toLowerCase().trim();
    if (!seen.has(key)) { seen.add(key); requirements.push([skill, "soft_skill"]); }
  }
  for (const kw of jd.domain_keywords) {
    const key = kw.toLowerCase().trim();
    if (!seen.has(key)) { seen.add(key); requirements.push([kw, "domain_keyword"]); }
  }
  for (const bait of jd.ats_bait) {
    const key = bait.toLowerCase().trim();
    if (!seen.has(key)) { seen.add(key); requirements.push([bait, "ats_bait"]); }
  }

  if (requirements.length === 0) {
    return {
      overall_match: 1.0,
      matched_count: 0,
      partial_count: 0,
      missing_count: 0,
      total_requirements: 0,
      gaps: [],
    };
  }

  const resumeEvidence = buildResumeEvidence(resume);
  if (resumeEvidence.length === 0) {
    return {
      overall_match: 0.0,
      matched_count: 0,
      partial_count: 0,
      missing_count: requirements.length,
      total_requirements: requirements.length,
      gaps: requirements.map(([req, cat]) => ({
        requirement: req,
        status: "missing" as const,
        similarity_score: 0.0,
        matched_evidence: null,
        category: cat as "hard_skill" | "soft_skill" | "domain_keyword" | "ats_bait",
      })),
    };
  }

  const allTexts = requirements.map((r) => r[0]).concat(resumeEvidence);
  const reqEmbeddings = await embedTexts(requirements.map((r) => r[0]), EMBEDDING_MODEL, "query");
  const resEmbeddings = await embedTexts(resumeEvidence, EMBEDDING_MODEL, "passage");

  const gaps: GapItem[] = [];
  for (let i = 0; i < requirements.length; i++) {
    const [reqText, category] = requirements[i];
    let bestScore = 0;
    let bestEvidence: string | null = null;

    for (let j = 0; j < resumeEvidence.length; j++) {
      const score = cosineSimilarity(reqEmbeddings[i], resEmbeddings[j]);
      if (score > bestScore) {
        bestScore = score;
        bestEvidence = resumeEvidence[j];
      }
    }

    let status: "matched" | "partial" | "missing";
    if (bestScore >= MATCH_THRESHOLD) {
      status = "matched";
    } else if (bestScore >= PARTIAL_THRESHOLD) {
      status = "partial";
    } else {
      status = "missing";
    }

    gaps.push({
      requirement: reqText,
      status,
      similarity_score: Math.round(bestScore * 10000) / 10000,
      matched_evidence: bestEvidence,
      category: category as "hard_skill" | "soft_skill" | "domain_keyword" | "ats_bait",
    });
  }

  gaps.sort((a, b) => a.similarity_score - b.similarity_score);

  const matched = gaps.filter((g) => g.status === "matched").length;
  const partial = gaps.filter((g) => g.status === "partial").length;
  const missing = gaps.filter((g) => g.status === "missing").length;
  const total = requirements.length;
  const overall = total > 0 ? (matched + partial * 0.5) / total : 0;

  return {
    overall_match: Math.round(overall * 10000) / 10000,
    matched_count: matched,
    partial_count: partial,
    missing_count: missing,
    total_requirements: total,
    gaps,
  };
}
