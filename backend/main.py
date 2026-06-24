import json
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agents.cover_letter_models import Tone
from db.sqlite_store import delete_run, get_run, init_db, list_runs, save_run, update_run
from parsers.docx_parser import parse_docx_bytes
from parsers.jd_url_fetcher import fetch_jd_from_url
from parsers.pdf_parser import parse_pdf_bytes
from pipeline import run_pipeline
from rate_limit import RateLimitMiddleware

ENV = os.environ.get("PROTEUS_ENV", "production")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://proteus-review.netlify.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="PROTEUS API",
    description="JD-aware application toolkit — semantic match scores, gap analysis, rewrite suggestions, and cover letters from a single JD.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if ENV == "development" else None,
    redoc_url="/api/redoc" if ENV == "development" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, max_requests=30, window_seconds=60)


class AnalyzeRequest(BaseModel):
    jd_text: str | None = None
    jd_url: str | None = None
    resume_text: str | None = None
    cover_letter_tone: str = "professional"


class AnalyzeResponse(BaseModel):
    run_id: int
    overall_score: float | None = None
    section_scores: dict | None = None
    gap_analysis: dict | None = None
    rewrite_suggestions: dict | None = None
    cover_letter: dict | None = None
    action_list: list | None = None
    timings: dict | None = None
    errors: list | None = None


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "proteus-backend", "env": ENV}


@app.post("/api/analyze")
async def analyze(
    jd_text: str | None = Form(None),
    jd_url: str | None = Form(None),
    jd_file: UploadFile | None = File(None),
    resume_text: str | None = Form(None),
    resume_file: UploadFile | None = File(None),
    cover_letter_tone: str = Form("professional"),
):
    resolved_jd = jd_text
    if not resolved_jd and jd_url:
        try:
            resolved_jd = fetch_jd_from_url(jd_url)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch JD from URL: {e}")
    if not resolved_jd and jd_file:
        content = await jd_file.read()
        filename = jd_file.filename or ""
        if filename.lower().endswith(".pdf"):
            resolved_jd = parse_pdf_bytes(content)
        elif filename.lower().endswith(".docx"):
            resolved_jd = parse_docx_bytes(content)
        else:
            resolved_jd = content.decode("utf-8", errors="ignore")

    if not resolved_jd:
        raise HTTPException(status_code=400, detail="No job description provided (text, URL, or file)")

    resolved_resume = resume_text
    if not resolved_resume and resume_file:
        content = await resume_file.read()
        filename = resume_file.filename or ""
        if filename.lower().endswith(".pdf"):
            resolved_resume = parse_pdf_bytes(content)
        elif filename.lower().endswith(".docx"):
            resolved_resume = parse_docx_bytes(content)
        else:
            resolved_resume = content.decode("utf-8", errors="ignore")

    if not resolved_resume:
        raise HTTPException(status_code=400, detail="No resume provided (text or file)")

    tone = Tone.PROFESSIONAL
    try:
        tone = Tone(cover_letter_tone)
    except ValueError:
        pass

    run_id = await save_run(
        jd_text=resolved_jd,
        jd_source="paste" if jd_text else "url" if jd_url else "file",
        resume_text=resolved_resume,
        resume_source="paste" if resume_text else "file",
        status="running",
    )

    try:
        result = await run_pipeline(resolved_jd, resolved_resume, cover_letter_tone=tone)

        await update_run(
            run_id,
            overall_score=result.aggregated.overall_score if result.aggregated else None,
            section_scores=json.dumps(result.aggregated.section_scores) if result.aggregated else None,
            gap_analysis=json.dumps(result.gap_analysis.model_dump()) if result.gap_analysis else None,
            rewrite_suggestions=json.dumps(result.rewrites.model_dump()) if result.rewrites else None,
            cover_letter=json.dumps(result.cover_letter.model_dump()) if result.cover_letter else None,
            action_list=json.dumps([a.model_dump() for a in result.aggregated.action_list]) if result.aggregated else None,
            status="completed" if not result.errors else "partial",
            error_message=json.dumps(result.errors) if result.errors else None,
        )

        return AnalyzeResponse(
            run_id=run_id,
            overall_score=result.aggregated.overall_score if result.aggregated else None,
            section_scores=result.aggregated.section_scores if result.aggregated else None,
            gap_analysis=result.gap_analysis.model_dump() if result.gap_analysis else None,
            rewrite_suggestions=result.rewrites.model_dump() if result.rewrites else None,
            cover_letter=result.cover_letter.model_dump() if result.cover_letter else None,
            action_list=[a.model_dump() for a in result.aggregated.action_list] if result.aggregated else None,
            timings=result.timings,
            errors=result.errors if result.errors else None,
        )
    except Exception as e:
        await update_run(run_id, status="failed", error_message=str(e))
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {e}")


@app.get("/api/history")
async def get_history(limit: int = 50, offset: int = 0):
    runs = await list_runs(limit=limit, offset=offset)
    return {"runs": runs, "count": len(runs)}


@app.get("/api/history/{run_id}")
async def get_run_detail(run_id: int):
    run = await get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    return run


@app.delete("/api/history/{run_id}")
async def delete_run_endpoint(run_id: int):
    deleted = await delete_run(run_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    return {"deleted": True, "run_id": run_id}


async def _stream_pipeline(jd_text: str, resume_text: str, tone: Tone) -> AsyncGenerator[str, None]:
    run_id = await save_run(
        jd_text=jd_text,
        jd_source="paste",
        resume_text=resume_text,
        resume_source="paste",
        status="running",
    )
    yield json.dumps({"event": "started", "run_id": run_id}) + "\n"

    try:
        result = await run_pipeline(jd_text, resume_text, cover_letter_tone=tone)

        if result.jd:
            yield json.dumps({"event": "jd_parsed", "data": result.jd.model_dump()}) + "\n"
        if result.resume:
            yield json.dumps({"event": "resume_parsed", "data": result.resume.model_dump()}) + "\n"
        if result.gap_analysis:
            yield json.dumps({"event": "gap_analysis", "data": result.gap_analysis.model_dump()}) + "\n"
        if result.rewrites:
            yield json.dumps({"event": "rewrites", "data": result.rewrites.model_dump()}) + "\n"
        if result.cover_letter:
            yield json.dumps({"event": "cover_letter", "data": result.cover_letter.model_dump()}) + "\n"
        if result.aggregated:
            yield json.dumps({"event": "result", "data": result.aggregated.model_dump()}) + "\n"

        await update_run(
            run_id,
            overall_score=result.aggregated.overall_score if result.aggregated else None,
            status="completed" if not result.errors else "partial",
            error_message=json.dumps(result.errors) if result.errors else None,
        )
        yield json.dumps({"event": "done", "run_id": run_id}) + "\n"

    except Exception as e:
        await update_run(run_id, status="failed", error_message=str(e))
        yield json.dumps({"event": "error", "message": str(e)}) + "\n"


@app.post("/api/analyze/stream")
async def analyze_stream(
    jd_text: str | None = Form(None),
    resume_text: str | None = Form(None),
    cover_letter_tone: str = Form("professional"),
):
    if not jd_text:
        raise HTTPException(status_code=400, detail="jd_text is required for streaming")
    if not resume_text:
        raise HTTPException(status_code=400, detail="resume_text is required for streaming")

    tone = Tone.PROFESSIONAL
    try:
        tone = Tone(cover_letter_tone)
    except ValueError:
        pass

    return StreamingResponse(
        _stream_pipeline(jd_text, resume_text, tone),
        media_type="application/x-ndjson",
    )
