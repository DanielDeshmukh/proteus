from agents.resume_models import ResumeStructured
from nim_client import chat_completion

RESUME_PARSER_MODEL = "mistralai/mistral-7b-instruct-v0.3"

RESUME_PARSER_SYSTEM_PROMPT = """You are an expert resume analyst. Given a raw resume text, extract structured information from it.

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

Be thorough. Extract every skill, every bullet point, every project. Return ONLY valid JSON, no markdown or explanation."""


def parse_resume(raw_resume_text: str) -> ResumeStructured:
    if not raw_resume_text or not raw_resume_text.strip():
        raise ValueError("Resume text cannot be empty")

    messages = [
        {"role": "system", "content": RESUME_PARSER_SYSTEM_PROMPT},
        {"role": "user", "content": f"Parse this resume:\n\n{raw_resume_text}"},
    ]

    response = chat_completion(
        model=RESUME_PARSER_MODEL,
        messages=messages,
        temperature=0.1,
        max_tokens=4096,
    )

    return ResumeStructured.model_validate_json(response)
