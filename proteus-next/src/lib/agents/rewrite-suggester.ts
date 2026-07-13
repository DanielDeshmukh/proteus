import { getModelForRole } from "../model-config";
import { RewriteOutputSchema, type RewriteOutput, type GapAnalysis, type JDStructured, type ResumeStructured } from "../../types";
import { callWithJsonRetry } from "./json-retry";

const REWRITE_MODEL = getModelForRole("rewrite-suggester");

const MAX_BULLETS = 20;

const REWRITE_SYSTEM_PROMPT = `You are an expert resume writer who specializes in tailoring resumes to specific job descriptions.

Given a job description, a resume, and a gap analysis identifying weak areas, generate specific rewrite suggestions for existing resume bullets.

For each suggestion:
- "original_bullet": The exact bullet text from the resume
- "suggested_rewrite": A rewritten version that incorporates JD keywords while staying truthful
- "rationale": Brief explanation of what was improved
- "target_requirement": Which JD requirement this addresses
- "impact_score": 0.0-1.0 estimate of how much this rewrite improves the match

Also identify "hidden_experience" — skills or experience the candidate HAS but isn't surfacing effectively in their resume.

Rules:
1. NEVER fabricate experience the candidate doesn't have
2. Rephrase existing experience to align with JD terminology
3. Add relevant keywords naturally into existing bullets
4. Quantify achievements where possible
5. Prioritize high-impact rewrites (biggest gaps first)

Return a JSON object with:
- "suggestions": Array of rewrite suggestion objects
- "hidden_experience": Array of hidden experience strings

Return ONLY valid JSON — no markdown, no explanation, no commentary, no text before or after the JSON.`;

export function suggestRewrites(
  jd: JDStructured,
  resume: ResumeStructured,
  gapAnalysis: GapAnalysis
): Promise<RewriteOutput> {
  const missingOrPartial = gapAnalysis.gaps
    .filter((g) => g.status === "missing" || g.status === "partial")
    .slice(0, 10);

  if (missingOrPartial.length === 0) {
    return Promise.resolve({ suggestions: [], hidden_experience: [] });
  }

  const resumeBullets: Array<{ bullet: string; role: string; company: string }> = [];
  for (const exp of resume.experience) {
    for (const bullet of exp.bullets) {
      resumeBullets.push({
        bullet,
        role: exp.role,
        company: exp.company || "Unknown",
      });
      if (resumeBullets.length >= MAX_BULLETS) break;
    }
    if (resumeBullets.length >= MAX_BULLETS) break;
  }

  const gapsContext = missingOrPartial.map((g) => ({
    requirement: g.requirement,
    status: g.status,
    score: g.similarity_score,
    category: g.category,
  }));

  const userPrompt = `Job Description:
Title: ${jd.title}
Hard Skills: ${jd.hard_skills.join(", ")}
Soft Skills: ${jd.soft_skills.join(", ")}
Domain Keywords: ${jd.domain_keywords.join(", ")}
ATS Bait: ${jd.ats_bait.join(", ")}

Resume:
Name: ${resume.name}
Skills: ${resume.skills.join(", ")}
Experience Bullets: ${JSON.stringify(resumeBullets, null, 2)}

Gap Analysis (requirements NOT well covered):
${JSON.stringify(gapsContext, null, 2)}

Generate rewrite suggestions for the bullets above to better match these gaps.`;

  return callWithJsonRetry(REWRITE_MODEL, REWRITE_SYSTEM_PROMPT, userPrompt, RewriteOutputSchema, {
    temperature: 0.3,
    maxTokens: 2560,
    role: "rewrite-suggester",
  }).then((output) => {
    if (output.suggestions && !Array.isArray(output.suggestions)) {
      output.suggestions = Object.values(output.suggestions as any);
    }
    output.suggestions.sort((a, b) => b.impact_score - a.impact_score);
    return output;
  });
}
