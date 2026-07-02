import { chatCompletion } from "../nim-client";
import { ResumeStructuredSchema, type ResumeStructured } from "../../types";

const RESUME_PARSER_MODEL = "mistralai/mistral-7b-instruct-v0.3";

const RESUME_PARSER_SYSTEM_PROMPT = `You are an expert resume analyst. Given a raw resume text, extract structured information from it.

Return a JSON object with these fields:
- "name": Candidate's full name
- "email": Email address (null if not found)
- "phone": Phone number (null if not found)
- "location": Candidate's location (null if not found)
- "linkedin": LinkedIn URL (null if not found)
- "github": GitHub URL (null if not found)
- "portfolio": Portfolio/website URL (null if not found)
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
  - "url": Project URL (null if not found)
- "education": Array of education objects, each with:
  - "degree": Degree obtained
  - "institution": School name
  - "year": Graduation year (null if not found)
  - "gpa": GPA (null if not found)
- "certifications": Array of certification objects, each with:
  - "name": Certification name
  - "issuer": Issuing org (null if not found)
  - "year": Year obtained (null if not found)
- "total_years_experience": Estimated total years of professional experience (null if cannot determine)

Be thorough. Extract every skill, every bullet point, every project. Return ONLY valid JSON, no markdown or explanation.`;

export function parseResume(rawResumeText: string): Promise<ResumeStructured> {
  if (!rawResumeText || !rawResumeText.trim()) {
    throw new Error("Resume text cannot be empty");
  }

  const messages = [
    { role: "system" as const, content: RESUME_PARSER_SYSTEM_PROMPT },
    { role: "user" as const, content: `Parse this resume:\n\n${rawResumeText}` },
  ];

  return chatCompletion(RESUME_PARSER_MODEL, messages, {
    temperature: 0.1,
    maxTokens: 4096,
  }).then((response) => {
    const parsed = JSON.parse(response);
    return ResumeStructuredSchema.parse(parsed);
  });
}
