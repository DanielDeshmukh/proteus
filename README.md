# PROTEUS

**One pipeline. One JD. Every output stays consistent.**

PROTEUS is a JD-aware application toolkit that takes a single job description — pasted, uploaded, or linked — and a candidate's resume, then runs both through a five-agent NVIDIA NIM pipeline to produce a semantic match score, a gap analysis, tailored rewrite suggestions, and a cover letter that's consistent with the resume's positioning. Everything is generated from the *same* parsed JD context, instead of being assembled piecemeal across five different AI tabs.

---

## Table of Contents

- [The Problem](#the-problem)
- [Why PROTEUS Exists](#why-proteus-exists)
- [How It Works](#how-it-works)
- [The Agent Pipeline](#the-agent-pipeline)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Roadmap](#roadmap)
- [License](#license)

---

## The Problem

AI-assisted job applications are no longer a niche behavior — they're the default. As of early 2026, the majority of job seekers report having used or planning to use AI somewhere in their job search, and roughly a third are already using AI tools directly to draft resumes, rewrite bullet points, and write cover letters — a sharp jump from just a year prior. On the employer side, ATS software now sits in the pipeline at nearly every large company, and AI-driven recruiting tools are being adopted by employers at an even faster rate than by candidates.

So the "AI vs. human" framing is mostly outdated. The real question is: **AI used how?**

A few data points worth sitting with:

- **The viral "75% of resumes get auto-rejected by ATS" stat is not real.** It has no credible primary source — it traces back to a marketing claim from a startup that shut down over a decade ago, and it keeps getting recycled because it's scary and quotable. ATS systems don't silently nuke 3 out of 4 resumes on arrival.
- **What actually gets resumes rejected isn't "AI wrote this," it's "this is generic."** Surveys converge around roughly half of hiring managers saying they'd dismiss a resume they *believe* is AI-generated — but a notably higher share specifically reject resumes that are AI-generated *and* unpersonalized. The personalization, not the tool, is the deciding factor.
- **Hiring managers are bad at detecting AI writing.** They claim high confidence (around three-quarters say they can spot it), but blind tests put actual detection accuracy at roughly a third. The thing they're really reacting to is generic phrasing, not some invisible AI fingerprint.
- **ATS scoring is mostly mechanical.** Keyword match against the job description accounts for a large share (often cited around 40-60%) of an ATS score, with the rest coming from clean formatting/parseability and complete, expected sections. This is a solvable, measurable problem — not a black box.

Put together: the failure mode isn't "I used AI." It's "I used AI generically, the same way for every application, without grounding it in this specific JD."

## Why PROTEUS Exists

The current "smart" way to apply with AI looks something like this:

1. Paste the JD into ChatGPT/Claude, ask it to rewrite your resume
2. Paste the result into a separate ATS scanner (Jobscan, CVCraft, etc.) to check keyword match
3. Open a third tool or a fresh prompt to generate a cover letter
4. Maybe run everything through a "humanizer" to sound less robotic
5. Manually patch all three outputs back into something coherent

Every handoff between tools loses context. The cover letter tool has no idea what the resume tool emphasized. The ATS scanner doesn't know what got rewritten. Nothing in the chain has the *full picture* — this JD, this candidate, this gap analysis — at the same time. That's structurally why the output ends up generic: generic isn't a property of the AI, it's a property of a workflow where every step starts from a blank slate.

**PROTEUS's core idea is simple: parse the JD once, and let that single structured understanding drive every downstream output.** The match score, the gap analysis, the rewrite suggestions, and the cover letter all read from the same context — so they tell one consistent story about why this candidate fits this role, instead of five disconnected AI outputs stapled together.

## How It Works

1. **Input the JD** — paste text, upload a file, or hand PROTEUS a job posting URL and it fetches and extracts the content.
2. **Input your resume** — paste text or upload a PDF/DOCX.
3. PROTEUS runs both through the agent pipeline (below).
4. You get back: a semantic match score, a prioritized gap report, specific rewrite suggestions for weak bullets, and a tailored cover letter — all referencing the same underlying JD analysis.

## The Agent Pipeline

PROTEUS is built as a five-stage pipeline (six including the cover letter stage), where each stage has one narrow job and passes structured output to the next.

| # | Agent | Job | NIM Model |
|---|-------|-----|-----------|
| 1 | **JD Parser** | Extracts structured requirements from the job description: hard skills, soft skills, seniority signals, domain keywords, and verbatim "ATS-bait" terms (specific tools/frameworks named in the posting) | `mistral-7b-instruct-v0.3` / `phi-3-mini-128k-instruct` |
| 2 | **Resume Parser** | Breaks the resume into structured, taggable units — skills, project descriptions, certifications, experience bullets — rather than treating it as one blob of text | `mistral-7b-instruct-v0.3` / `phi-3-mini-128k-instruct` |
| 3 | **Semantic Gap Analyzer** | Embeds both the JD requirements and resume bullets and computes similarity — so "experience with vector databases" correctly matches "implemented Qdrant-based retrieval" even with zero literal keyword overlap. Outputs a ranked list of requirements by gap size | `nvidia/nv-embedqa-e5-v5` (no LLM call — pure embedding + cosine similarity) |
| 4 | **Rewrite Suggester** | For high-gap items, generates specific rewrite suggestions for existing bullets, or flags experience that exists but isn't surfaced | `llama-3.3-70b-instruct` / `qwen2.5-coder-32b-instruct` (for technical roles) |
| 5 | **Cover Letter Generator** | Drafts a cover letter using the *same* JD structure, resume structure, and gap analysis as agent 4 — so the cover letter and resume rewrites tell a consistent story instead of being generated independently | `llama-3.3-70b-instruct` |
| 6 | **Score Aggregator** | Rolls everything into an overall match score and a prioritized action list. Pure code — weighted scoring, no LLM call needed | — |

Agents run as a plain sequential async chain (no LangGraph) since the pipeline is linear with no branching — JD parse and resume parse can run in parallel, then gap analysis → rewrite + cover letter → aggregation.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind
- **Backend:** FastAPI
- **LLM Inference:** NVIDIA NIM (OpenAI-compatible API — `base_url="https://integrate.api.nvidia.com/v1"`)
- **Embeddings:** `nvidia/nv-embedqa-e5-v5`
- **File Parsing:** `pypdf` / `pdfplumber` (PDF), `python-docx` (DOCX)
- **JD URL Ingestion:** `httpx` + content extraction
- **Storage:** SQLite (local — application history and run logs, no external DB dependency)

## Features

- **Three ways to input a JD:** paste text, upload a file, or paste a job posting URL
- **Two ways to input a resume:** paste text or upload PDF/DOCX
- **Semantic match scoring** — goes beyond keyword matching using embedding similarity
- **Gap analysis report** — ranked list of what's missing and how badly
- **Tailored rewrite suggestions** — specific, bullet-level, JD-aware
- **Consistent cover letter generation** — written from the same context as the resume analysis, not in isolation
- **Application history** — every run logged locally to SQLite for tracking match scores and outcomes over time

## Project Structure

```
proteus/
├── backend/
│   ├── main.py                 # FastAPI app entrypoint
│   ├── agents/
│   │   ├── jd_parser.py
│   │   ├── resume_parser.py
│   │   ├── gap_analyzer.py
│   │   ├── rewrite_suggester.py
│   │   ├── cover_letter.py
│   │   └── aggregator.py
│   ├── pipeline.py             # orchestrates the async chain
│   ├── parsers/
│   │   ├── pdf_parser.py
│   │   ├── docx_parser.py
│   │   └── jd_url_fetcher.py
│   ├── db/
│   │   └── sqlite_store.py
│   └── nim_client.py           # NIM API wrapper
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── ...
└── README.md
```

## Setup

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt --break-system-packages
export NVIDIA_NIM_API_KEY=your_key_here
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Roadmap

- **v1** — Core pipeline + web UI: JD/resume ingestion, scoring, gap analysis, rewrite suggestions, cover letter generation
- **v2** — Application tracking dashboard: visualize match scores and outcomes across all logged runs over time
- **v3** — Browser extension for one-click JD capture from job board pages
- **Stretch** — Company/role context enrichment (stage, focus areas) to adjust cover letter tone per target company; multi-resume version management for different role tracks

## License

MIT

---

*Built by [Daniel Deshmukh](https://github.com/DanielDeshmukh) · Mumbai, India*