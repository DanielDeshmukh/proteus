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
- [Project Structure](#project-structure)
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
| 1 | **JD Parser** | Extracts structured requirements from the JD | `mistral-7b-instruct-v0.3` |
| 2 | **Resume Parser** | Breaks the resume into structured, taggable units | `mistral-7b-instruct-v0.3` |
| 3 | **Gap Analyzer** | Embeds both, computes cosine similarity, ranks gaps | `nvidia/nv-embedqa-e5-v5` |
| 4 | **Rewrite Suggester** | JD-aware bullet rewrites for weak areas | `meta/llama-3.3-70b-instruct` |
| 5 | **Cover Letter** | Tailored letter from the same context | `meta/llama-3.3-70b-instruct` |
| 6 | **Aggregator** | Weighted scoring + action list (no LLM) | — |

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 — dark theme with Fraunces, Inter, JetBrains Mono
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

## Project Structure

```
proteus/
├── proteus-next/                   # Next.js fullstack app
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── analyze/         # POST /api/analyze
│   │   │   │   ├── analyze/stream/  # POST /api/analyze/stream (NDJSON)
│   │   │   │   ├── health/          # GET /api/health
│   │   │   │   └── history/         # GET /api/history, DELETE /api/history/[id]
│   │   │   ├── (dashboard)/
│   │   │   │   ├── analyze/page.tsx
│   │   │   │   └── history/page.tsx
│   │   │   └── layout.tsx
│   │   ├── components/              # 14 React components
│   │   ├── lib/
│   │   │   ├── agents/              # 6 agents + pipeline orchestrator
│   │   │   ├── db.ts                # Dual-backend SQLite (local / Vercel)
│   │   │   ├── nim-client.ts        # NVIDIA NIM API client
│   │   │   ├── pdf-parser.ts
│   │   │   ├── docx-parser.ts
│   │   │   ├── jd-url-fetcher.ts
│   │   │   └── api.ts               # Frontend API client
│   │   └── types/                   # Zod schemas + TypeScript types
│   ├── vercel.json
│   └── package.json
├── PROGRESS.md
└── README.md
```

## Setup

```bash
cd proteus-next
npm install

# Set your NVIDIA NIM API key
cp .env.local.example .env.local
# Edit .env.local and add your NVIDIA_NIM_API_KEY

npm run dev
# App runs on http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_NIM_API_KEY` | Yes | NVIDIA NIM API key for LLM inference |
| `DATABASE_URL` | No | Turso/libsql URL for Vercel (local SQLite used if unset) |
| `DATABASE_AUTH_TOKEN` | No | Turso auth token (required with DATABASE_URL) |

## Deployment

### Vercel

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Set `NVIDIA_NIM_API_KEY` in Vercel environment variables
4. Deploy

### Docker

```bash
docker compose up
# App runs on http://localhost:3000
```

## License

MIT

---

*Built by [Daniel Deshmukh](https://github.com/DanielDeshmukh) · Mumbai, India*
