import { chatCompletion, extractJson } from "../nim-client";
import { JDStructuredSchema, type JDStructured } from "../../types";

const JD_PARSER_MODEL = "meta/llama-3.1-8b-instruct";

const JD_PARSER_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst and job description parser.
Given a raw job description text, extract structured information from it.

Return a JSON object with these fields:
- "title": The job title
- "company": Company name (null if not found)
- "location": Job location or Remote/Hybrid/Onsite (null if not found)
- "seniority_level": One of: junior, mid, senior, lead, principal, executive
- "hard_skills": Array of technical skills, tools, frameworks, programming languages required
- "soft_skills": Array of soft skills like communication, leadership, etc.
- "domain_keywords": Array of industry/domain-specific terms
- "ats_bait": Array of EXACT tool/framework names as they appear in the posting (for ATS keyword matching)
- "requirements_summary": 2-3 sentence summary of core requirements
- "nice_to_haves": Array of preferred but not required qualifications

Be thorough but precise. Extract only what is explicitly stated or strongly implied.
Return ONLY valid JSON, no markdown or explanation.`;

export function parseJd(rawJdText: string): Promise<JDStructured> {
  if (!rawJdText || !rawJdText.trim()) {
    throw new Error("Job description text cannot be empty");
  }

  const messages = [
    { role: "system" as const, content: JD_PARSER_SYSTEM_PROMPT },
    { role: "user" as const, content: `Parse this job description:\n\n${rawJdText}` },
  ];

  return chatCompletion(JD_PARSER_MODEL, messages, {
    temperature: 0.1,
    maxTokens: 2048,
  }).then((response) => {
    const parsed = JSON.parse(extractJson(response));
    return JDStructuredSchema.parse(parsed);
  });
}
