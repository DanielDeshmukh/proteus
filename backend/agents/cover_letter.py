import json
from nim_client import chat_completion
from agents.cover_letter_models import CoverLetterOutput, Tone
from agents.jd_models import JDStructured
from agents.resume_models import ResumeStructured
from agents.gap_models import GapAnalysis

COVER_LETTER_MODEL = "meta/llama-3.3-70b-instruct"

COVER_LETTER_SYSTEM_PROMPT = """You are an expert cover letter writer who creates tailored, compelling cover letters.

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
- "full_letter": The complete cover letter text
- "sections": Array of section objects with "heading" and "content"
- "tone": The tone used
- "key_points_addressed": Which JD requirements were highlighted
- "word_count": Approximate word count

Return ONLY valid JSON, no markdown or explanation."""


def generate_cover_letter(
    jd: JDStructured,
    resume: ResumeStructured,
    gap_analysis: GapAnalysis,
    tone: Tone = Tone.PROFESSIONAL,
) -> CoverLetterOutput:
    matched_requirements = [
        g.requirement for g in gap_analysis.gaps
        if g.similarity_score >= 0.7
    ][:5]

    resume_highlights = []
    for exp in resume.experience[:3]:
        resume_highlights.append({
            "role": exp.role,
            "company": exp.company,
            "top_bullets": exp.bullets[:2],
        })

    user_prompt = f"""Job Description:
Title: {jd.title}
Company: {jd.company or 'the company'}
Location: {jd.location or 'Not specified'}
Seniority: {jd.seniority_level}
Hard Skills: {', '.join(jd.hard_skills)}
Soft Skills: {', '.join(jd.soft_skills)}
Requirements Summary: {jd.requirements_summary}

Candidate Resume:
Name: {resume.name}
Top Skills: {', '.join(resume.skills[:10])}
Experience: {json.dumps(resume_highlights, indent=2)}
Education: {', '.join(e.degree + ' - ' + e.institution for e in resume.education)}

Gap Analysis:
Matched Requirements: {', '.join(matched_requirements) if matched_requirements else 'None strongly matched'}
Missing Requirements: {', '.join(g.requirement for g in gap_analysis.gaps if g.similarity_score < 0.45)[:3]}

Write a {tone.value} cover letter for this candidate applying to this role."""

    messages = [
        {"role": "system", "content": COVER_LETTER_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    response = chat_completion(
        model=COVER_LETTER_MODEL,
        messages=messages,
        temperature=0.4,
        max_tokens=3000,
    )

    return CoverLetterOutput.model_validate_json(response)
