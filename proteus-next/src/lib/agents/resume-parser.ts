import { getModelForRole } from "../model-config";
import { ResumeStructuredSchema, type ResumeStructured } from "../../types";
import { callWithJsonRetry } from "./json-retry";

const RESUME_PARSER_MODEL = getModelForRole("resume-parser");

const MAX_RESUME_CHARS = 10000;

const RESUME_PARSER_SYSTEM_PROMPT = `You are an expert resume analyst. Given a raw resume text, extract structured information from it.

## Output Format
Return a JSON object with these fields:
- "name": Candidate's full name
- "email": Email address (null if not found)
- "phone": Phone number (null if not found)
- "location": Candidate's location (null if not found)
- "summary": Professional summary/objective paragraph (null if not present)
- "skills": Array of ALL technical skills, tools, frameworks, languages mentioned
- "experience": Array of work experience objects, each with:
  - "role": Job title
  - "company": Company name (null if not found)
  - "duration": Employment period as written (null if not found)
  - "bullets": Array of bullet points for that role
- "projects": Array of project objects, each with:
  - "name": Project name
  - "description": Brief description
  - "technologies": Array of technologies used
- "education": Array of education objects, each with:
  - "degree": Degree obtained
  - "institution": School name
  - "year": Graduation year (null if not found)
  - "gpa": GPA (null if not found)
- "certifications": Array of certification objects, each with:
  - "name": Certification name
  - "issuer": Issuing org (null if not found)
  - "year": Year obtained (null if not found)

Be thorough. Extract every skill, every bullet point, every project.
Return ONLY valid JSON — no markdown, no explanation, no commentary, no text before or after the JSON.`;

export function parseResume(rawResumeText: string): Promise<ResumeStructured> {
  if (!rawResumeText || !rawResumeText.trim()) {
    throw new Error("Resume text cannot be empty");
  }

  let text = rawResumeText.trim();
  if (text.length > MAX_RESUME_CHARS) {
    text = text.substring(0, MAX_RESUME_CHARS).trimEnd();
  }

  const userContent = `Parse this resume:\n\n${text}`;

  return callWithJsonRetry(RESUME_PARSER_MODEL, RESUME_PARSER_SYSTEM_PROMPT, userContent, ResumeStructuredSchema, {
    temperature: 0.1,
    maxTokens: 3072,
    role: "resume-parser",
  });
}
