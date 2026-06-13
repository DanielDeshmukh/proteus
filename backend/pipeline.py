import asyncio
import time
import logging
from dataclasses import dataclass, field

from agents.jd_parser import parse_jd
from agents.resume_parser import parse_resume
from agents.gap_analyzer import analyze_gaps
from agents.rewrite_suggester import suggest_rewrites
from agents.cover_letter import generate_cover_letter
from agents.cover_letter_models import Tone
from agents.aggregator import aggregate_scores, PipelineOutput
from agents.gap_models import GapAnalysis
from agents.jd_models import JDStructured
from agents.resume_models import ResumeStructured
from agents.rewrite_models import RewriteOutput
from agents.cover_letter_models import CoverLetterOutput

logger = logging.getLogger("proteus.pipeline")


@dataclass
class PipelineResult:
    jd: JDStructured | None = None
    resume: ResumeStructured | None = None
    gap_analysis: GapAnalysis | None = None
    rewrites: RewriteOutput | None = None
    cover_letter: CoverLetterOutput | None = None
    aggregated: PipelineOutput | None = None
    timings: dict[str, float] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)


async def run_pipeline(
    jd_text: str,
    resume_text: str,
    cover_letter_tone: Tone = Tone.PROFESSIONAL,
) -> PipelineResult:
    result = PipelineResult()

    t0 = time.perf_counter()

    try:
        jd_task = asyncio.to_thread(parse_jd, jd_text)
        resume_task = asyncio.to_thread(parse_resume, resume_text)
        jd_coro, resume_coro = await asyncio.gather(jd_task, resume_task, return_exceptions=True)

        if isinstance(jd_coro, Exception):
            result.errors.append(f"JD parsing failed: {jd_coro}")
            return result
        if isinstance(resume_coro, Exception):
            result.errors.append(f"Resume parsing failed: {resume_coro}")
            return result

        result.jd = jd_coro
        result.resume = resume_coro
        result.timings["parse"] = time.perf_counter() - t0
        logger.info(f"Parsed JD ({len(jd_text)} chars) and resume ({len(resume_text)} chars) in {result.timings['parse']:.2f}s")
    except Exception as e:
        result.errors.append(f"Parse stage failed: {e}")
        return result

    t1 = time.perf_counter()
    try:
        result.gap_analysis = await asyncio.to_thread(analyze_gaps, result.jd, result.resume)
        result.timings["gap_analysis"] = time.perf_counter() - t1
        logger.info(f"Gap analysis complete in {result.timings['gap_analysis']:.2f}s")
    except Exception as e:
        result.errors.append(f"Gap analysis failed: {e}")
        result.timings["gap_analysis"] = time.perf_counter() - t1
        return result

    t2 = time.perf_counter()
    try:
        rewrites_task = asyncio.to_thread(suggest_rewrites, result.jd, result.resume, result.gap_analysis)
        cover_task = asyncio.to_thread(generate_cover_letter, result.jd, result.resume, result.gap_analysis, cover_letter_tone)
        rewrites_coro, cover_coro = await asyncio.gather(rewrites_task, cover_task, return_exceptions=True)

        if isinstance(rewrites_coro, Exception):
            result.errors.append(f"Rewrite suggester failed: {rewrites_coro}")
        else:
            result.rewrites = rewrites_coro

        if isinstance(cover_coro, Exception):
            result.errors.append(f"Cover letter generator failed: {cover_coro}")
        else:
            result.cover_letter = cover_coro

        result.timings["generate"] = time.perf_counter() - t2
        logger.info(f"Generation complete in {result.timings['generate']:.2f}s")
    except Exception as e:
        result.errors.append(f"Generate stage failed: {e}")
        result.timings["generate"] = time.perf_counter() - t2

    t3 = time.perf_counter()
    try:
        result.aggregated = aggregate_scores(result.gap_analysis)
        result.timings["aggregate"] = time.perf_counter() - t3
        result.timings["total"] = time.perf_counter() - t0
        logger.info(f"Aggregation complete in {result.timings['aggregate']:.2f}s")
    except Exception as e:
        result.errors.append(f"Aggregation failed: {e}")
        result.timings["aggregate"] = time.perf_counter() - t3

    return result
