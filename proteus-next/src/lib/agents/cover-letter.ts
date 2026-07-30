import { CoverLetterOutputSchema, type CoverLetterOutput, type Tone, type GapAnalysis, type JDStructured, type ResumeStructured } from "../../types";
import { groqChatCompletion } from "../groq-client";
import { getModelForRole } from "../model-config";
import { ZodSchema } from "zod";

function getCoverLetterModel(): string {
  try { return getModelForRole("cover-letter"); } catch { return "llama-3.3-70b-versatile"; }
}

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer who creates tailored, compelling cover letters.

Given a job description, a candidate's resume, and a gap analysis, write a cover letter that:
1. Addresses the specific role and company by NAME
2. Uses the candidate's ACTUAL name from the resume
3. Highlights the candidate's MOST relevant experience for THIS role with SPECIFIC examples from their resume
4. Directly addresses key requirements from the JD using the candidate's real skills and accomplishments
5. Uses the candidate's actual experience (never fabricate, never use placeholders)
6. Maintains a consistent narrative with what the resume emphasizes

CRITICAL RULES — VIOLATION WILL RESULT IN REJECTION:
- NEVER use placeholder text like [Name], [Company], [related skill], [desirable trait], [achievement], [previous position], or any bracketed text
- NEVER write generic sentences like "I have developed a strong foundation in [related skill or industry]"
- ALWAYS use the candidate's real name, real company names, real skill names, and real achievements from the resume
- If you don't have enough information, write briefly about what you DO know rather than using placeholders
- Every claim must be grounded in something from the resume or JD

The cover letter should have these sections:
- Opening: Hook + role interest + company connection (use company name from JD)
- Why This Role: Connect candidate's specific background to JD requirements
- Key Qualifications: 2-3 strongest matches with specific examples from the resume
- Closing: Enthusiasm + call to action

TONE GUIDELINES:
- "professional": Formal, measured, traditional business letter style
- "enthusiastic": Warmer, shows genuine excitement, more personality
- "concise": Short, direct, no fluff, gets to the point fast

Return a JSON object with:
- "job_title": The job title this letter is addressing
- "full_letter": The complete cover letter text. SEPARATE each paragraph with a blank line (double newline \n\n). The letter MUST have: greeting line, blank line, opening paragraph, blank line, body paragraphs, blank line, closing. Must use the candidate's real name from the resume.
- "sections": Array of section objects with "heading" and "content"
- "tone": The tone used
- "key_points_addressed": Which JD requirements were highlighted
- "word_count": Approximate word count

Return ONLY valid JSON — no markdown, no explanation, no commentary, no text before or after the JSON.`;

function sanitizeJsonString(s: string): string {
  let result = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (esc) { result += ch; esc = false; continue; }
    if (inStr && ch === "\\") { result += ch; esc = true; continue; }
    if (!inStr && ch === '"') { inStr = true; result += ch; continue; }
    if (inStr && ch === '"') { inStr = false; result += ch; continue; }
    if (inStr) {
      const code = ch.charCodeAt(0);
      if (code === 0x0a) { result += "\\n"; continue; }
      if (code === 0x0d) { result += "\\r"; continue; }
      if (code === 0x09) { result += "\\t"; continue; }
      if (code < 0x20) { result += `\\u${code.toString(16).padStart(4, "0")}`; continue; }
    }
    result += ch;
  }
  return result;
}

function extractJson(text: string): string {
  let cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let start = -1;
  if (firstBrace >= 0 && firstBracket >= 0) start = Math.min(firstBrace, firstBracket);
  else if (firstBrace >= 0) start = firstBrace;
  else if (firstBracket >= 0) start = firstBracket;
  if (start > 0) cleaned = cleaned.substring(start);

  let depth = 0, inString = false, escape = false, end = -1;
  const startChar = cleaned[0];
  const closeChar = startChar === "{" ? "}" : "]";
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === startChar || ch === closeChar) {
      if (ch === startChar) depth++; else depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end >= 0) cleaned = cleaned.substring(0, end + 1);
  return sanitizeJsonString(cleaned.trim());
}

async function callWithRetry<T>(
  model: string,
  systemPrompt: string,
  userContent: string,
  schema: ZodSchema<T>,
  maxRetries = 2
): Promise<T> {
  let messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userContent },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await groqChatCompletion(model, messages, {
        temperature: attempt === 0 ? 0.4 : 0.1,
        maxTokens: 2000,
      });

      const jsonStr = extractJson(response);
      const parsed = JSON.parse(jsonStr);
      return schema.parse(parsed);
    } catch (e: any) {
      lastError = e;
      messages = [
        { role: "system" as const, content: systemPrompt + "\n\nIMPORTANT: Your previous response was NOT valid JSON. You MUST return ONLY a valid JSON object. No text before or after. No markdown code fences. Just the raw JSON starting with { and ending with }." },
        { role: "user" as const, content: userContent },
      ];
    }
  }

  throw lastError || new Error("Cover letter generation failed after retries");
}

export function generateCoverLetter(
  jd: JDStructured,
  resume: ResumeStructured,
  gapAnalysis: GapAnalysis,
  tone: Tone = "professional"
): Promise<CoverLetterOutput> {
  const matchedRequirements = gapAnalysis.gaps
    .filter((g) => g.similarity_score >= 0.7)
    .slice(0, 5)
    .map((g) => g.requirement);

  const resumeHighlights = resume.experience.slice(0, 3).map((exp) => ({
    role: exp.role,
    company: exp.company,
    top_bullets: exp.bullets.slice(0, 2),
  }));

  const userPrompt = `Job Description:
Title: ${jd.title}
Company: ${jd.company || "the company"}
Location: ${jd.location || "Not specified"}
Seniority: ${jd.seniority_level}
Hard Skills: ${jd.hard_skills.join(", ")}
Soft Skills: ${jd.soft_skills.join(", ")}
Requirements Summary: ${jd.requirements_summary}

Candidate Resume:
Name: ${resume.name}
Top Skills: ${resume.skills.slice(0, 10).join(", ")}
Experience: ${JSON.stringify(resumeHighlights, null, 2)}
Education: ${resume.education.map((e) => `${e.degree} - ${e.institution}`).join(", ")}
Certifications: ${resume.certifications?.map((c) => c.name).join(", ") || "None listed"}

Gap Analysis:
Matched Requirements: ${matchedRequirements.length > 0 ? matchedRequirements.join(", ") : "None strongly matched"}
Missing Requirements: ${gapAnalysis.gaps
    .filter((g) => g.similarity_score < 0.45)
    .slice(0, 3)
    .map((g) => g.requirement)
    .join(", ")}

CRITICAL: The candidate's name is "${resume.name}". You MUST use EXACTLY this name in the letter closing (e.g., "Sincerely, ${resume.name}"). Do NOT use any other name.

Write a ${tone} cover letter for this candidate applying to this role.`;

  return callWithRetry(getCoverLetterModel(), COVER_LETTER_SYSTEM_PROMPT, userPrompt, CoverLetterOutputSchema);
}
