import { embedTexts } from "../nim-client";
import { getModelForRole } from "../model-config";
import type { JDStructured, ResumeStructured, GapAnalysis, GapItem } from "../../types";

const EMBEDDING_MODEL = getModelForRole("gap-analyzer");
const MATCH_THRESHOLD = 0.45;
const PARTIAL_THRESHOLD = 0.25;

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

function buildEvidenceLookup(evidence: string[]): { texts: string[]; lower: string[]; words: Set<string> } {
  const lower = evidence.map((e) => e.toLowerCase());
  const words = new Set<string>();
  for (const l of lower) {
    for (const w of l.split(/[^a-z0-9]+/)) {
      if (w.length >= 2) words.add(w);
    }
  }
  return { texts: evidence, lower, words };
}

function exactMatchScore(req: string, lookup: { texts: string[]; lower: string[]; words: Set<string> }): { score: number; evidence: string | null } {
  const reqLower = req.toLowerCase().trim();

  // 1. Exact substring match in any evidence line
  for (let i = 0; i < lookup.lower.length; i++) {
    if (lookup.lower[i].includes(reqLower) || reqLower.includes(lookup.lower[i])) {
      return { score: 1.0, evidence: lookup.texts[i] };
    }
  }

  // 2. Single-word exact match (e.g., "python" appears as a standalone word)
  const reqWords = reqLower.split(/[^a-z0-9]+/).filter((w) => w.length >= 2);
  for (const rw of reqWords) {
    if (lookup.words.has(rw)) {
      // Find the evidence line containing this word
      for (let i = 0; i < lookup.lower.length; i++) {
        if (lookup.lower[i].split(/[^a-z0-9]+/).includes(rw)) {
          return { score: 0.95, evidence: lookup.texts[i] };
        }
      }
    }
  }

  // 3. Multi-word: if ALL words of the requirement appear somewhere in evidence
  if (reqWords.length > 1) {
    const allFound = reqWords.every((w) => lookup.words.has(w));
    if (allFound) {
      return { score: 0.85, evidence: lookup.texts.find((t) => reqWords.every((w) => t.toLowerCase().includes(w))) || null };
    }
  }

  return { score: 0, evidence: null };
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

  const lookup = buildEvidenceLookup(resumeEvidence);

  // Phase 1: exact/fuzzy string matching (fast, no API calls)
  const exactResults: Array<{ req: string; cat: string; score: number; evidence: string | null }> = [];
  const needEmbedding: Array<{ idx: number; req: string; cat: string }> = [];

  for (let i = 0; i < requirements.length; i++) {
    const [reqText, category] = requirements[i];
    const exact = exactMatchScore(reqText, lookup);
    if (exact.score >= 0.85) {
      exactResults.push({ req: reqText, cat: category, score: exact.score, evidence: exact.evidence });
    } else {
      needEmbedding.push({ idx: i, req: reqText, cat: category });
    }
  }

  // Phase 2: embedding similarity only for items not matched exactly
  const gaps: GapItem[] = [];

  // Add exact matches
  for (const er of exactResults) {
    gaps.push({
      requirement: er.req,
      status: "matched",
      similarity_score: er.score,
      matched_evidence: er.evidence,
      category: er.cat as "hard_skill" | "soft_skill" | "domain_keyword" | "ats_bait",
    });
  }

  // Embedding comparison for remaining items
  if (needEmbedding.length > 0) {
    const reqEmbeddings = await embedTexts(needEmbedding.map((n) => n.req), EMBEDDING_MODEL, "query");
    const resEmbeddings = await embedTexts(resumeEvidence, EMBEDDING_MODEL, "passage");

    for (let k = 0; k < needEmbedding.length; k++) {
      const { req: reqText, cat: category } = needEmbedding[k];
      let bestScore = 0;
      let bestEvidence: string | null = null;

      for (let j = 0; j < resumeEvidence.length; j++) {
        const score = cosineSimilarity(reqEmbeddings[k], resEmbeddings[j]);
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
  }

  gaps.sort((a, b) => a.similarity_score - b.similarity_score);

  const matched = gaps.filter((g) => g.status === "matched").length;
  const partial = gaps.filter((g) => g.status === "partial").length;
  const missing = gaps.filter((g) => g.status === "missing").length;
  const total = requirements.length;
  const overall = total > 0 ? (matched * 1.0 + partial * 0.65) / total : 0;

  return {
    overall_match: Math.round(overall * 10000) / 10000,
    matched_count: matched,
    partial_count: partial,
    missing_count: missing,
    total_requirements: total,
    gaps,
  };
}
