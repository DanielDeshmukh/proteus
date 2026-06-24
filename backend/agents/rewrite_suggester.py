import json

from agents.gap_models import GapAnalysis, MatchStatus
from agents.jd_models import JDStructured
from agents.resume_models import ResumeStructured
from agents.rewrite_models import RewriteOutput
from nim_client import chat_completion

REWRITE_MODEL = "meta/llama-3.3-70b-instruct"

REWRITE_SYSTEM_PROMPT = """You are an expert resume writer who specializes in tailoring resumes to specific job descriptions.

Given a job description, a resume, and a gap analysis identifying weak areas, generate specific rewrite suggestions for existing resume bullets.

For each suggestion:
- "original_bullet": The exact bullet text from the resume
- "suggested_rewrite": A rewritten version that incorporates JD keywords while staying truthful
- "rationale": Brief explanation of what was improved
- "target_requirement": Which JD requirement this addresses
- "impact_score": 0.0-1.0 estimate of how much this rewrite improves the match
- "experience_context": Which job/project the bullet came from

Also identify "hidden_experience" — skills or experience the candidate HAS but isn't surfacing effectively in their resume.

Rules:
1. NEVER fabricate experience the candidate doesn't have
2. Rephrase existing experience to align with JD terminology
3. Add relevant keywords naturally into existing bullets
4. Quantify achievements where possible
5. Prioritize high-impact rewrites (biggest gaps first)

Return ONLY valid JSON, no markdown or explanation."""


def suggest_rewrites(
    jd: JDStructured,
    resume: ResumeStructured,
    gap_analysis: GapAnalysis,
) -> RewriteOutput:
    missing_or_partial = [
        g for g in gap_analysis.gaps
        if g.status in (MatchStatus.MISSING, MatchStatus.PARTIAL)
    ]

    if not missing_or_partial:
        return RewriteOutput(suggestions=[], hidden_experience=[])

    missing_or_partial = missing_or_partial[:10]

    resume_bullets = []
    for exp in resume.experience:
        for bullet in exp.bullets:
            resume_bullets.append({
                "bullet": bullet,
                "role": exp.role,
                "company": exp.company or "Unknown",
                "context": f"{exp.role} at {exp.company or 'Unknown'}",
            })

    gaps_context = []
    for g in missing_or_partial:
        gaps_context.append({
            "requirement": g.requirement,
            "status": g.status.value,
            "score": g.similarity_score,
            "category": g.category,
        })

    user_prompt = f"""Job Description:
Title: {jd.title}
Hard Skills: {', '.join(jd.hard_skills)}
Soft Skills: {', '.join(jd.soft_skills)}
Domain Keywords: {', '.join(jd.domain_keywords)}
ATS Bait: {', '.join(jd.ats_bait)}

Resume:
Name: {resume.name}
Skills: {', '.join(resume.skills)}
Experience Bullets: {json.dumps(resume_bullets, indent=2)}

Gap Analysis (requirements NOT well covered):
{json.dumps(gaps_context, indent=2)}

Generate rewrite suggestions for the bullets above to better match these gaps."""

    messages = [
        {"role": "system", "content": REWRITE_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    response = chat_completion(
        model=REWRITE_MODEL,
        messages=messages,
        temperature=0.3,
        max_tokens=4096,
    )

    output = RewriteOutput.model_validate_json(response)
    output.suggestions.sort(key=lambda s: s.impact_score, reverse=True)
    return output
