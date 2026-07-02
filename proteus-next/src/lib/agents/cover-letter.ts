import { chatCompletion, extractJson } from "../nim-client";
import { CoverLetterOutputSchema, type CoverLetterOutput, type Tone, type GapAnalysis, type JDStructured, type ResumeStructured } from "../../types";

const COVER_LETTER_MODEL = "meta/llama-3.3-70b-instruct";

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer who creates tailored, compelling cover letters.

Given a job description, a candidate's resume, and a gap analysis, write a cover letter that:
1. Addresses the specific role and company
2. Highlights the candidate's MOST relevant experience for THIS role
3. Directly addresses key requirements from the JD
4. Uses the candidate's actual experience (never fabricate)
5. Maintains a consistent narrative with what the resume emphasizes

The cover letter should have these sections:
- Opening: Hook + role interest + company connection
- Why This Role: Connect candidate's background to JD requirements
- Key Qualifications: 2-3 strongest matches with specific examples
- Closing: Enthusiasm + call to action

TONE GUIDELINES:
- "professional": Formal, measured, traditional business letter style
- "enthusiastic": Warmer, shows genuine excitement, more personality
- "concise": Short, direct, no fluff, gets to the point fast

Return a JSON object with:
- "job_title": The job title this letter is addressing
- "full_letter": The complete cover letter text
- "sections": Array of section objects with "heading" and "content"
- "tone": The tone used
- "key_points_addressed": Which JD requirements were highlighted
- "word_count": Approximate word count

Return ONLY valid JSON, no markdown or explanation.`;

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

Gap Analysis:
Matched Requirements: ${matchedRequirements.length > 0 ? matchedRequirements.join(", ") : "None strongly matched"}
Missing Requirements: ${gapAnalysis.gaps
    .filter((g) => g.similarity_score < 0.45)
    .slice(0, 3)
    .map((g) => g.requirement)
    .join(", ")}

Write a ${tone} cover letter for this candidate applying to this role.`;

  const messages = [
    { role: "system" as const, content: COVER_LETTER_SYSTEM_PROMPT },
    { role: "user" as const, content: userPrompt },
  ];

  return chatCompletion(COVER_LETTER_MODEL, messages, {
    temperature: 0.4,
    maxTokens: 3000,
  }).then((response) => {
    const parsed = JSON.parse(extractJson(response));
    return CoverLetterOutputSchema.parse(parsed);
  });
}
