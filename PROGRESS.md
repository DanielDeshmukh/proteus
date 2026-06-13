# PROTEUS — Progress Tracker

> **Workflow:** Each feature gets its own branch. Each feature is broken into ~8-10 atomic phases. After each phase, I stop and wait for your permission to proceed. After all phases of a feature complete, brute-force tests run across the whole project.

---

## Feature 0: Project Scaffolding & Infrastructure
**Branch:** `feature/project-setup`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 0.1 | Initialize backend Python project — `pyproject.toml`, virtual env, `requirements.txt` with FastAPI, uvicorn, httpx, pypdf, pdfplumber, python-docx | ✅ Done | |
| 0.2 | Initialize frontend React project — Vite + Tailwind, clean boilerplate | ✅ Done | |
| 0.3 | Create backend directory structure: `agents/`, `parsers/`, `db/`, `main.py`, `pipeline.py`, `nim_client.py` | ✅ Done | |
| 0.4 | Create frontend directory structure: `components/`, `pages/`, `App.jsx` | ✅ Done | |
| 0.5 | Set up NVIDIA NIM client wrapper (`nim_client.py`) — OpenAI-compatible base URL, API key from env, request helpers for chat completions and embeddings | ✅ Done | |
| 0.6 | Set up SQLite store (`db/sqlite_store.py`) — schema for application runs, match scores, timestamps | ✅ Done | |
| 0.7 | Configure CORS, basic health-check endpoint in `main.py`, verify backend starts | ✅ Done | |
| 0.8 | Configure Vite proxy to backend, verify frontend starts and can reach backend | ✅ Done | |
| 0.9 | **TEST CHECKPOINT** — Smoke test: backend health endpoint returns 200, frontend renders, NIM client connects | ✅ Done | 5/5 tests pass |

---

## Feature 1: JD Parser Agent
**Branch:** `feature/jd-parser`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 1.1 | Design JD parsing prompt — structured output: hard skills, soft skills, seniority signals, domain keywords, ATS-bait terms | ⬜ Pending | |
| 1.2 | Implement `agents/jd_parser.py` — takes raw JD text, calls NIM with structured prompt, returns parsed JD object | ⬜ Pending | |
| 1.3 | Define Pydantic models for JD structure (skills, keywords, seniority, etc.) | ⬜ Pending | |
| 1.4 | Add input validation — handle empty/malformed JD text, rate limit errors | ⬜ Pending | |
| 1.5 | Unit test: JD parser with sample job descriptions (tech role, non-tech role, minimal JD) | ⬜ Pending | |
| 1.6 | Unit test: edge cases — all-caps JD, very short JD, JD with no skills mentioned | ⬜ Pending | |
| 1.7 | Integration test: JD parser → NIM API call (mock or live) | ⬜ Pending | |
| 1.8 | Create sample JD fixtures for testing | ⬜ Pending | |
| 1.9 | **TEST CHECKPOINT** — Full unit + integration suite for JD parser | ⬜ Pending | |

---

## Feature 2: Resume Parser Agent
**Branch:** `feature/resume-parser`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 2.1 | Design resume parsing prompt — structured output: skills, experience bullets, projects, certifications, education | ⬜ Pending | |
| 2.2 | Implement `agents/resume_parser.py` — takes raw resume text, calls NIM, returns structured resume object | ⬜ Pending | |
| 2.3 | Define Pydantic models for resume structure | ⬜ Pending | |
| 2.4 | Add input validation — handle truncated resumes, missing sections | ⬜ Pending | |
| 2.5 | Unit test: resume parser with sample resumes (experienced candidate, fresh grad, career switcher) | ⬜ Pending | |
| 2.6 | Unit test: edge cases — 1-page resume, 5-page resume, no bullet points | ⬜ Pending | |
| 2.7 | Integration test: resume parser → NIM API call | ⬜ Pending | |
| 2.8 | Create sample resume fixtures for testing | ⬜ Pending | |
| 2.9 | **TEST CHECKPOINT** — Full unit + integration suite for resume parser | ⬜ Pending | |

---

## Feature 3: File Parsers (PDF, DOCX, URL)
**Branch:** `feature/file-parsers`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 3.1 | Implement `parsers/pdf_parser.py` — extract text from PDF using pypdf/pdfplumber | ⬜ Pending | |
| 3.2 | Implement `parsers/docx_parser.py` — extract text from DOCX using python-docx | ⬜ Pending | |
| 3.3 | Implement `parsers/jd_url_fetcher.py` — fetch URL content with httpx, extract job posting text (handle common job board structures) | ⬜ Pending | |
| 3.4 | Add error handling — corrupted files, unsupported formats, inaccessible URLs | ⬜ Pending | |
| 3.5 | Unit test: PDF parser with various PDFs (text-heavy, image-based, multi-column) | ⬜ Pending | |
| 3.6 | Unit test: DOCX parser with various DOCX files | ⬜ Pending | |
| 3.7 | Unit test: URL fetcher with mock responses (LinkedIn, Indeed, Greenhouse, Lever) | ⬜ Pending | |
| 3.8 | Unit test: edge cases — empty file, 0-byte PDF, invalid URL | ⬜ Pending | |
| 3.9 | **TEST CHECKPOINT** — Full unit suite for all parsers | ⬜ Pending | |

---

## Feature 4: Gap Analyzer Agent
**Branch:** `feature/gap-analyzer`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 4.1 | Set up embedding model integration — `nvidia/nv-embedqa-e5-v5` via NIM client | ⬜ Pending | |
| 4.2 | Implement embedding computation for JD requirements and resume bullets | ⬜ Pending | |
| 4.3 | Implement cosine similarity scoring between JD embeddings and resume embeddings | ⬜ Pending | |
| 4.4 | Implement `agents/gap_analyzer.py` — rank requirements by gap size, classify as matched/partial/missing | ⬜ Pending | |
| 4.5 | Define Pydantic models for gap analysis output (ranked gaps, match status, scores) | ⬜ Pending | |
| 4.6 | Unit test: gap analyzer with known JD-resume pairs (clear match, clear gap, partial match) | ⬜ Pending | |
| 4.7 | Unit test: semantic matching — "vector databases" matches "Qdrant-based retrieval" | ⬜ Pending | |
| 4.8 | Unit test: edge cases — empty resume, JD with no skills, perfect match | ⬜ Pending | |
| 4.9 | Integration test: JD parse → resume parse → gap analysis pipeline | ⬜ Pending | |
| 4.10 | **TEST CHECKPOINT** — Full unit + integration suite for gap analyzer | ⬜ Pending | |

---

## Feature 5: Rewrite Suggester Agent
**Branch:** `feature/rewrite-suggester`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 5.1 | Design rewrite prompt — takes high-gap items, generates specific bullet rewrites | ⬜ Pending | |
| 5.2 | Implement `agents/rewrite_suggester.py` — for each high-gap item, suggest rewrite or surface hidden experience | ⬜ Pending | |
| 5.3 | Define Pydantic models for rewrite suggestions (original, suggested, rationale, confidence) | ⬜ Pending | |
| 5.4 | Add prioritization — order suggestions by impact (largest gaps first) | ⬜ Pending | |
| 5.5 | Unit test: rewrite suggester with sample high-gap items | ⬜ Pending | |
| 5.6 | Unit test: edge cases — no gaps found, all gaps critical, empty resume bullets | ⬜ Pending | |
| 5.7 | Integration test: full pipeline up to rewrite stage | ⬜ Pending | |
| 5.8 | **TEST CHECKPOINT** — Full unit + integration suite for rewrite suggester | ⬜ Pending | |

---

## Feature 6: Cover Letter Generator Agent
**Branch:** `feature/cover-letter`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 6.1 | Design cover letter prompt — uses same JD structure + resume structure + gap analysis for consistency | ⬜ Pending | |
| 6.2 | Implement `agents/cover_letter.py` — generates tailored cover letter from shared context | ⬜ Pending | |
| 6.3 | Define Pydantic models for cover letter output (sections, tone, key points) | ⬜ Pending | |
| 6.4 | Add tone control — professional, enthusiastic, concise variants | ⬜ Pending | |
| 6.5 | Unit test: cover letter generator with different JD/resume combinations | ⬜ Pending | |
| 6.6 | Unit test: verify cover letter references actual resume experience (not hallucinated) | ⬜ Pending | |
| 6.7 | Unit test: edge cases — very short JD, no experience to highlight | ⬜ Pending | |
| 6.8 | Integration test: full pipeline through cover letter generation | ⬜ Pending | |
| 6.9 | **TEST CHECKPOINT** — Full unit + integration suite for cover letter | ⬜ Pending | |

---

## Feature 7: Score Aggregator & Pipeline Orchestrator
**Branch:** `feature/pipeline`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 7.1 | Implement `agents/aggregator.py` — weighted scoring (keyword match 40-60%, semantic match, completeness), no LLM call | ⬜ Pending | |
| 7.2 | Define final output schema — overall score, section scores, prioritized action list | ⬜ Pending | |
| 7.3 | Implement `pipeline.py` — async sequential chain: JD parse ∥ resume parse → gap analysis → rewrite + cover letter → aggregation | ⬜ Pending | |
| 7.4 | Add parallel execution for JD parse and resume parse (asyncio.gather) | ⬜ Pending | |
| 7.5 | Add error handling — if one agent fails, gracefully degrade or report partial results | ⬜ Pending | |
| 7.6 | Add logging/timing for each pipeline stage | ⬜ Pending | |
| 7.7 | Unit test: aggregator with mock gap analysis results | ⬜ Pending | |
| 7.8 | Integration test: full pipeline end-to-end (mocked NIM calls) | ⬜ Pending | |
| 7.9 | Integration test: full pipeline with real NIM calls (live test) | ⬜ Pending | |
| 7.10 | **TEST CHECKPOINT** — Full pipeline test suite | ⬜ Pending | |

---

## Feature 8: Backend API Endpoints
**Branch:** `feature/backend-api`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 8.1 | `POST /api/analyze` — accepts JD (text/file/url) + resume (text/file), runs pipeline, returns results | ⬜ Pending | |
| 8.2 | `GET /api/history` — returns list of past application runs from SQLite | ⬜ Pending | |
| 8.3 | `GET /api/history/{id}` — returns single run details | ⬜ Pending | |
| 8.4 | `DELETE /api/history/{id}` — deletes a run | ⬜ Pending | |
| 8.5 | File upload handling — multipart form data for PDF/DOCX uploads | ⬜ Pending | |
| 8.6 | Request validation — Pydantic models for all endpoints, proper error responses | ⬜ Pending | |
| 8.7 | Add streaming/SSE endpoint for real-time pipeline progress (`POST /api/analyze/stream`) | ⬜ Pending | |
| 8.8 | Unit test: all API endpoints with test client | ⬜ Pending | |
| 8.9 | Unit test: error handling — invalid files, missing fields, NIM API failures | ⬜ Pending | |
| 8.10 | **TEST CHECKPOINT** — Full API test suite | ⬜ Pending | |

---

## Feature 9: Frontend — Core UI & JD Input
**Branch:** `feature/frontend-jd-input`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 9.1 | Set up React Router, global layout (header, sidebar, main content area) | ⬜ Pending | |
| 9.2 | Build reusable UI components — Button, Card, TextArea, FileUpload, Spinner, Toast | ⬜ Pending | |
| 9.3 | Build JD input component — tabbed interface: Paste / Upload / URL | ⬜ Pending | |
| 9.4 | Implement paste tab — large textarea for JD text | ⬜ Pending | |
| 9.5 | Implement upload tab — drag-and-drop or click-to-upload for JD files | ⬜ Pending | |
| 9.6 | Implement URL tab — input field + fetch button, show extracted preview | ⬜ Pending | |
| 9.7 | Add validation — prevent submission without JD, show errors inline | ⬜ Pending | |
| 9.8 | Style with Tailwind — responsive layout, clean design | ⬜ Pending | |
| 9.9 | **TEST CHECKPOINT** — Component render tests, interaction tests | ⬜ Pending | |

---

## Feature 10: Frontend — Resume Input & Analysis Trigger
**Branch:** `feature/frontend-resume-input`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 10.1 | Build resume input component — tabbed: Paste / Upload | ⬜ Pending | |
| 10.2 | Implement paste tab — textarea for resume text | ⬜ Pending | |
| 10.3 | Implement upload tab — file upload for PDF/DOCX with preview | ⬜ Pending | |
| 10.4 | Build "Analyze" button — triggers API call with both JD and resume data | ⬜ Pending | |
| 10.5 | Add loading state — show pipeline progress (which agent is running) | ⬜ Pending | |
| 10.6 | Connect to backend `/api/analyze` or `/api/analyze/stream` | ⬜ Pending | |
| 10.7 | Handle API errors — network failures, timeout, server errors | ⬜ Pending | |
| 10.8 | Unit test: resume input component, form submission flow | ⬜ Pending | |
| 10.9 | **TEST CHECKPOINT** — Component + integration tests | ⬜ Pending | |

---

## Feature 11: Frontend — Results Display
**Branch:** `feature/frontend-results`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 11.1 | Build results page layout — sections for score, gaps, rewrites, cover letter | ⬜ Pending | |
| 11.2 | Build match score display — large score number, color-coded (red/yellow/green), breakdown by category | ⬜ Pending | |
| 11.3 | Build gap analysis display — ranked list with severity indicators, matched/missing/partial tags | ⬜ Pending | |
| 11.4 | Build rewrite suggestions display — side-by-side original vs suggested, with rationale | ⬜ Pending | |
| 11.5 | Build cover letter display — formatted, copy-to-clipboard button, tone selector | ⬜ Pending | |
| 11.6 | Build action list — prioritized next steps from aggregator | ⬜ Pending | |
| 11.7 | Add export — download results as PDF or JSON | ⬜ Pending | |
| 11.8 | Style results page — responsive, scannable, print-friendly | ⬜ Pending | |
| 11.9 | **TEST CHECKPOINT** — Results rendering tests with mock data | ⬜ Pending | |

---

## Feature 12: Frontend — Application History
**Branch:** `feature/frontend-history`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 12.1 | Build history page — table/list of past runs with date, company, role, score | ⬜ Pending | |
| 12.2 | Add search/filter — by company name, score range, date range | ⬜ Pending | |
| 12.3 | Add click-to-view — navigate to full results for a past run | ⬜ Pending | |
| 12.4 | Add delete — remove a run from history | ⬜ Pending | |
| 12.5 | Add score trend visualization — simple chart showing match scores over time | ⬜ Pending | |
| 12.6 | Connect to backend `/api/history` endpoints | ⬜ Pending | |
| 12.7 | Empty state — message when no history exists | ⬜ Pending | |
| 12.8 | **TEST CHECKPOINT** — History component tests with mock data | ⬜ Pending | |

---

## Feature 13: End-to-End Integration & Polish
**Branch:** `feature/e2e-polish`

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| 13.1 | E2E test: full flow — paste JD + upload resume → view results → check history | ⬜ Pending | |
| 13.2 | E2E test: URL-based JD ingestion flow | ⬜ Pending | |
| 13.3 | E2E test: error scenarios — bad file, network timeout, empty inputs | ⬜ Pending | |
| 13.4 | Performance check — pipeline completes in <30s for typical inputs | ⬜ Pending | |
| 13.5 | Accessibility pass — keyboard navigation, screen reader labels, color contrast | ⬜ Pending | |
| 13.6 | Mobile responsiveness — verify all pages work on small screens | ⬜ Pending | |
| 13.7 | Final README update — accurate setup instructions, feature screenshots | ⬜ Pending | |
| 13.8 | Final code review — no secrets logged, proper error handling throughout | ⬜ Pending | |
| 13.9 | **FINAL TEST CHECKPOINT** — Full test suite: unit, integration, E2E | ⬜ Pending | |

---

## Summary

| Feature | Phases | Status |
|---------|--------|--------|
| 0 — Project Scaffolding | 9 | ✅ Complete |
| 1 — JD Parser Agent | 9 | ⬜ Not Started |
| 2 — Resume Parser Agent | 9 | ⬜ Not Started |
| 3 — File Parsers | 9 | ⬜ Not Started |
| 4 — Gap Analyzer Agent | 10 | ⬜ Not Started |
| 5 — Rewrite Suggester | 8 | ⬜ Not Started |
| 6 — Cover Letter Generator | 9 | ⬜ Not Started |
| 7 — Pipeline & Aggregator | 10 | ⬜ Not Started |
| 8 — Backend API | 10 | ⬜ Not Started |
| 9 — Frontend: JD Input | 9 | ⬜ Not Started |
| 10 — Frontend: Resume Input | 9 | ⬜ Not Started |
| 11 — Frontend: Results Display | 9 | ⬜ Not Started |
| 12 — Frontend: History | 8 | ⬜ Not Started |
| 13 — E2E Integration | 9 | ⬜ Not Started |
| **Total** | **126** | |

---

*Last updated: 2026-06-13*
