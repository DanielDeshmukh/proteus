import { chatCompletion, extractJson } from "../nim-client";
import { RewriteOutputSchema, type RewriteOutput, type GapAnalysis, type JDStructured, type ResumeStructured } from "../../types";

const REWRITE_MODEL = "meta/llama-3.3-70b-instruct";

const REWRITE_SYSTEM_PROMPT = `You are an expert resume writer who specializes in tailoring resumes to specific job descriptions.

Given a job description, a resume, and a gap analysis identifying weak areas, generate specific rewrite suggestions for existing resume bullets.

For each suggestion:
- "original_bullet": The exact bullet text from the resume
- "suggested_rewrite": A rewritten version that incorporates JD keywords while staying truthful
- "rationale": Brief explanation of what was improved
- "target_requirement": Which JD requirement this addresses
- "impact_score": 0.0-1.0 estimate of how much this rewrite improves the match
- "experience_context": Which job/project the bullet came from

Also identify "hidden_experience" — skills or experience the candidate HAS but isn't surfacing effectively in their resume.

Rules:
1. NEVER fabricate experience the candidate doesn't have
2. Rephrase existing experience to align with JD terminology
3. Add relevant keywords naturally into existing bullets
4. Quantify achievements where possible
5. Prioritize high-impact rewrites (biggest gaps first)

Return ONLY valid JSON, no markdown or explanation.`;

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

  const resumeBullets = [];
  for (const exp of resume.experience) {
    for (const bullet of exp.bullets) {
      resumeBullets.push({
        bullet,
        role: exp.role,
        company: exp.company || "Unknown",
        context: `${exp.role} at ${exp.company || "Unknown"}`,
      });
    }
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

  const messages = [
    { role: "system" as const, content: REWRITE_SYSTEM_PROMPT },
    { role: "user" as const, content: userPrompt },
  ];

  return chatCompletion(REWRITE_MODEL, messages, {
    temperature: 0.3,
    maxTokens: 4096,
  }).then((response) => {
    const cleaned = extractJson(response);
    console.log("[REWRITE RAW]", cleaned.substring(0, 500));
    const parsed = JSON.parse(cleaned);
    console.log("[REWRITE PARSED] type:", typeof parsed, "isArray:", Array.isArray(parsed), "keys:", Array.isArray(parsed) ? "array" : Object.keys(parsed));
    
    let normalized = parsed;
    if (Array.isArray(parsed)) {
      normalized = { suggestions: parsed, hidden_experience: [] };
    } else if (parsed.suggestions && !Array.isArray(parsed.suggestions)) {
      normalized = { ...parsed, suggestions: Object.values(parsed.suggestions) };
    } else if (parsed.rewrite_suggestions) {
      normalized = { suggestions: parsed.rewrite_suggestions, hidden_experience: parsed.hidden_experience || [] };
    }
    
    const output = RewriteOutputSchema.parse(normalized);
    output.suggestions.sort((a, b) => b.impact_score - a.impact_score);
    return output;
  });
}
