# PROTEUS

**One pipeline. One JD. Every output stays consistent.**

PROTEUS is a JD-aware application toolkit that takes a single job description and a candidate's resume, then runs both through a five-agent NVIDIA NIM pipeline to produce a semantic match score, a gap analysis, tailored rewrite suggestions, and a cover letter — all generated from the same parsed JD context.

---

## Table of Contents

- [The Problem](#the-problem)
- [How It Works](#how-it-works)
- [The Agent Pipeline](#the-agent-pipeline)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup](#setup)
- [Deployment](#deployment)
- [License](#license)

---

## The Problem

AI-assisted job applications are the default. The failure mode isn't "I used AI" — it's "I used AI generically, the same way for every application, without grounding it in this specific JD."

PROTEUS's core idea: **parse the JD once, and let that single structured understanding drive every downstream output.** The match score, gap analysis, rewrite suggestions, and cover letter all read from the same context — one consistent story, not five disconnected AI outputs stapled together.

## How It Works

1. **Input the JD** — paste text, upload a file, or paste a job posting URL.
2. **Input your resume** — paste text or upload a PDF/DOCX.
3. PROTEUS runs both through the agent pipeline.
4. You get: a semantic match score, a prioritized gap report, bullet-level rewrite suggestions, and a tailored cover letter.

## The Agent Pipeline

| # | Agent | Job | NIM Model |
|---|-------|-----|-----------|
| 1 | **JD Parser** | Extracts structured requirements from the JD | `parser` |
| 2 | **Resume Parser** | Breaks the resume into structured, taggable units | `parser` |
| 3 | **Gap Analyzer** | Embeds both, computes cosine similarity, ranks gaps | `embedder` |
| 4 | **Rewrite Suggester** | JD-aware bullet rewrites for weak areas | `rewriter` |
| 5 | **Cover Letter** | Tailored letter from the same context | `rewriter` |
| 6 | **Aggregator** | Weighted scoring + action list (no LLM) | — |

> Model names are resolved at runtime from `models.json`. The health check bot keeps them updated.

<!-- MODELS AUTO-GENERATED START -->
### Active Models (auto-updated by health check bot)

| Role | Model | Last Checked |
|------|-------|--------------|
| jd-parser | `nvidia/gliner-pii` | 2026-07-05T16:12:38.680Z |
| resume-parser | `nvidia/nemotron-3-super-120b-a12b` | 2026-07-05T16:12:38.680Z |
| gap-analyzer | `nvidia/nv-embedqa-e5-v5` | 2026-07-05T16:12:38.680Z |
| rewrite-suggester | `nvidia/llama-3.3-nemotron-super-49b-v1.5` | 2026-07-05T16:12:38.680Z |
| cover-letter | `meta/llama-3.1-8b-instruct` | 2026-07-05T16:12:38.680Z |
<!-- END MODELS AUTO-GENERATED -->

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 — dark theme with Geist fonts
- **LLM Inference:** NVIDIA NIM (OpenAI-compatible API)
- **Database:** better-sqlite3 (local) / @libsql (Vercel/Turso)
- **Validation:** Zod v4
- **Deployment:** Vercel-ready

## Features

- Three ways to input a JD: paste, upload, or URL
- Two ways to input a resume: paste or upload PDF/DOCX
- Semantic match scoring (embedding-based, not keyword matching)
- Gap analysis ranked by impact with severity badges
- Bullet-level rewrite suggestions with before/after comparison
- Consistent cover letter generated from the same context
- Application history with score tracking
- Streaming API (NDJSON) for real-time pipeline progress
- Dark theme UI with gold accent design system
- Interactive twinkling dot grid background

## Setup

```bash
cd proteus-next
npm install

# Set your NVIDIA NIM API key
cp .env.example .env
# Edit .env and add your NVIDIA_NIM_API_KEY

npm run dev
# App runs on http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_NIM_API_KEY` | Yes | NVIDIA NIM API key for LLM inference |
| `DATABASE_URL` | Vercel only | Turso/libsql URL (local SQLite used if unset) |
| `DATABASE_AUTH_TOKEN` | Vercel only | Turso auth token (required with DATABASE_URL) |

## Deployment

### Vercel

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Set root directory to `proteus-next`
4. Set environment variables:
   - `NVIDIA_NIM_API_KEY` — your NVIDIA NIM key
   - `DATABASE_URL` — your Turso database URL (sign up free at [turso.tech](https://turso.tech))
   - `DATABASE_AUTH_TOKEN` — your Turso auth token
5. Deploy

---

*Built by [Daniel Deshmukh](https://github.com/DanielDeshmukh) · Mumbai, India*
