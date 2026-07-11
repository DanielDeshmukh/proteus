import { getModelForRole } from "../model-config";
import { JDStructuredSchema, type JDStructured } from "../../types";
import { callWithJsonRetry } from "./json-retry";

const JD_PARSER_MODEL = getModelForRole("jd-parser");

const MAX_JD_CHARS = 12000;

const JD_PARSER_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst and job description parser.

## CRITICAL RULE — NOISY INPUT HANDLING
The input text may come from a web scrape and contain MULTIPLE job listings, navigation bars, sidebars, footers, ads, cookie notices, and other noise. You MUST:

1. SCAN the entire text for all job descriptions present
2. PICK the SINGLE job description that has the MOST detail — the one with the longest responsibilities, requirements, qualifications, and company description
3. IGNORE all other shorter/less-detailed listings, navigation links, footer text, sidebar content, ads, and any non-job-description text
4. Extract structured information ONLY from that one best job description

If the text contains multiple jobs of similar detail, pick the one that appears FIRST with a full description (title + company + detailed responsibilities).

## Output Format
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
Return ONLY valid JSON — no markdown, no explanation, no commentary, no text before or after the JSON.`;

export function parseJd(rawJdText: string): Promise<JDStructured> {
  if (!rawJdText || !rawJdText.trim()) {
    throw new Error("Job description text cannot be empty");
  }

  let text = rawJdText.trim();
  if (text.length > MAX_JD_CHARS) {
    text = text.substring(0, MAX_JD_CHARS).trimEnd();
  }

  const userContent = `Parse this job description. The text may be a noisy web scrape with multiple job listings and navigation elements. Find the SINGLE most detailed job description and extract from it only:

${text}`;

  return callWithJsonRetry(JD_PARSER_MODEL, JD_PARSER_SYSTEM_PROMPT, userContent, JDStructuredSchema, {
    temperature: 0.1,
    maxTokens: 2048,
    role: "jd-parser",
  });
}
