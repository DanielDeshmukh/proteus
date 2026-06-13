import math
from nim_client import embed_texts
from agents.gap_models import GapItem, GapAnalysis, MatchStatus
from agents.jd_models import JDStructured
from agents.resume_models import ResumeStructured


EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5"

MATCH_THRESHOLD = 0.70
PARTIAL_THRESHOLD = 0.45


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _build_resume_evidence(resume: ResumeStructured) -> list[str]:
    evidence = []
    evidence.extend(resume.skills)
    for exp in resume.experience:
        for bullet in exp.bullets:
            evidence.append(bullet)
    for proj in resume.projects:
        evidence.append(f"{proj.name}: {proj.description} ({', '.join(proj.technologies)})")
    return evidence


def analyze_gaps(jd: JDStructured, resume: ResumeStructured) -> GapAnalysis:
    requirements: list[tuple[str, str]] = []
    for skill in jd.hard_skills:
        requirements.append((skill, "hard_skill"))
    for skill in jd.soft_skills:
        requirements.append((skill, "soft_skill"))
    for kw in jd.domain_keywords:
        requirements.append((kw, "domain_keyword"))
    for bait in jd.ats_bait:
        requirements.append((bait, "ats_bait"))

    if not requirements:
        return GapAnalysis(
            overall_match=1.0,
            matched_count=0,
            partial_count=0,
            missing_count=0,
            total_requirements=0,
            gaps=[],
        )

    resume_evidence = _build_resume_evidence(resume)
    if not resume_evidence:
        return GapAnalysis(
            overall_match=0.0,
            matched_count=0,
            partial_count=0,
            missing_count=len(requirements),
            total_requirements=len(requirements),
            gaps=[
                GapItem(
                    requirement=req,
                    status=MatchStatus.MISSING,
                    similarity_score=0.0,
                    matched_evidence=None,
                    category=cat,
                )
                for req, cat in requirements
            ],
        )

    all_texts = [r[0] for r in requirements] + resume_evidence
    embeddings = embed_texts(all_texts, model=EMBEDDING_MODEL)

    req_embeddings = embeddings[: len(requirements)]
    res_embeddings = embeddings[len(requirements) :]

    gaps: list[GapItem] = []
    for i, (req_text, category) in enumerate(reqlications):
        best_score = 0.0
        best_evidence = None
        for j, res_text in enumerate(resume_evidence):
            score = cosine_similarity(req_embeddings[i], res_embeddings[j])
            if score > best_score:
                best_score = score
                best_evidence = res_text

        if best_score >= MATCH_THRESHOLD:
            status = MatchStatus.MATCHED
        elif best_score >= PARTIAL_THRESHOLD:
            status = MatchStatus.PARTIAL
        else:
            status = MatchStatus.MISSING

        gaps.append(
            GapItem(
                requirement=req_text,
                status=status,
                similarity_score=round(best_score, 4),
                matched_evidence=best_evidence,
                category=category,
            )
        )

    gaps.sort(key=lambda g: g.similarity_score)

    matched = sum(1 for g in gaps if g.status == MatchStatus.MATCHED)
    partial = sum(1 for g in gaps if g.status == MatchStatus.PARTIAL)
    missing = sum(1 for g in gaps if g.status == MatchStatus.MISSING)
    total = len(requirements)
    overall = (matched + partial * 0.5) / total if total > 0 else 0.0

    return GapAnalysis(
        overall_match=round(overall, 4),
        matched_count=matched,
        partial_count=partial,
        missing_count=missing,
        total_requirements=total,
        gaps=gaps,
    )
