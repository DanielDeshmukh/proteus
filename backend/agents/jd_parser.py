from nim_client import chat_completion
from agents.jd_models import JDStructured

JD_PARSER_MODEL = "mistralai/mistral-7b-instruct-v0.3"

JD_PARSER_SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) analyst and job description parser.
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
Return ONLY valid JSON, no markdown or explanation."""


def parse_jd(raw_jd_text: str) -> JDStructured:
    if not raw_jd_text or not raw_jd_text.strip():
        raise ValueError("Job description text cannot be empty")

    messages = [
        {"role": "system", "content": JD_PARSER_SYSTEM_PROMPT},
        {"role": "user", "content": f"Parse this job description:\n\n{raw_jd_text}"},
    ]

    response = chat_completion(
        model=JD_PARSER_MODEL,
        messages=messages,
        temperature=0.1,
        max_tokens=2048,
    )

    return JDStructured.model_validate_json(response)
