import { getModelForRole } from "../model-config";
import { CoverLetterOutputSchema, type CoverLetterOutput, type Tone, type GapAnalysis, type JDStructured, type ResumeStructured } from "../../types";
import { callWithJsonRetry } from "./json-retry";

const COVER_LETTER_MODEL = getModelForRole("cover-letter");

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
- "full_letter": The complete cover letter text (must use the candidate's real name from the resume, not placeholders)
- "sections": Array of section objects with "heading" and "content"
- "tone": The tone used
- "key_points_addressed": Which JD requirements were highlighted
- "word_count": Approximate word count

Return ONLY valid JSON — no markdown, no explanation, no commentary, no text before or after the JSON.`;

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

IMPORTANT: Use the candidate's ACTUAL name "${resume.name}" throughout the letter. Use real company names, real skill names, and real achievements from the experience section above. Do NOT use any placeholder text in brackets.

Write a ${tone} cover letter for this candidate applying to this role.`;

  return callWithJsonRetry(COVER_LETTER_MODEL, COVER_LETTER_SYSTEM_PROMPT, userPrompt, CoverLetterOutputSchema, {
    temperature: 0.4,
    maxTokens: 2000,
    cleanControlChars: true,
    role: "cover-letter",
  });
}
