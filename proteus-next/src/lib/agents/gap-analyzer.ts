import type { JDStructured, ResumeStructured, GapAnalysis, GapItem } from "../../types";

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

function matchScore(req: string, lookup: { texts: string[]; lower: string[]; words: Set<string> }): { score: number; evidence: string | null; status: "matched" | "partial" | "missing" } {
  const reqLower = req.toLowerCase().trim();

  // 1. Exact substring match
  for (let i = 0; i < lookup.lower.length; i++) {
    if (lookup.lower[i].includes(reqLower) || reqLower.includes(lookup.lower[i])) {
      return { score: 1.0, evidence: lookup.texts[i], status: "matched" };
    }
  }

  // 2. Single-word exact match
  const reqWords = reqLower.split(/[^a-z0-9]+/).filter((w) => w.length >= 2);
  for (const rw of reqWords) {
    if (lookup.words.has(rw)) {
      for (let i = 0; i < lookup.lower.length; i++) {
        if (lookup.lower[i].split(/[^a-z0-9]+/).includes(rw)) {
          return { score: 0.95, evidence: lookup.texts[i], status: "matched" };
        }
      }
    }
  }

  // 3. Multi-word: all words found
  if (reqWords.length > 1) {
    const allFound = reqWords.every((w) => lookup.words.has(w));
    if (allFound) {
      const evidenceLine = lookup.texts.find((t) => reqWords.every((w) => t.toLowerCase().includes(w))) || null;
      return { score: 0.85, evidence: evidenceLine, status: "matched" };
    }
  }

  // 4. Partial: at least one word matches
  const matchedWords = reqWords.filter((w) => lookup.words.has(w));
  if (matchedWords.length > 0 && matchedWords.length < reqWords.length) {
    return { score: matchedWords.length / reqWords.length, evidence: null, status: "partial" };
  }

  return { score: 0, evidence: null, status: "missing" };
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

  const gaps: GapItem[] = [];
  for (const [reqText, category] of requirements) {
    const result = matchScore(reqText, lookup);
    gaps.push({
      requirement: reqText,
      status: result.status,
      similarity_score: Math.round(result.score * 10000) / 10000,
      matched_evidence: result.evidence,
      category: category as "hard_skill" | "soft_skill" | "domain_keyword" | "ats_bait",
    });
  }

  gaps.sort((a, b) => a.similarity_score - b.similarity_score);

  const matched = gaps.filter((g) => g.status === "matched").length;
  const partial = gaps.filter((g) => g.status === "partial").length;
  const missing = gaps.filter((g) => g.status === "missing").length;
  const total = requirements.length;
  const overall = total > 0 ? (matched * 1.0 + partial * 0.6) / total : 0;

  return {
    overall_match: Math.round(overall * 10000) / 10000,
    matched_count: matched,
    partial_count: partial,
    missing_count: missing,
    total_requirements: total,
    gaps,
  };
}
