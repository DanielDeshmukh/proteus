<p align="center">
  <img src="banner.png" alt="PROTEUS" width="100%" />
</p>



<p align="center">
  <a href="https://proteus-phi.vercel.app">
    <img src="https://img.shields.io/badge/LIVE_APP-proteus--phi.vercel.app-76b900?style=for-the-badge&logo=vercel&logoColor=white&bg_color=1a1d21" alt="Live App" />
  </a>
  <a href="https://proteus-phi.vercel.app/docs">
    <img src="https://img.shields.io/badge/DOCS-proteus--phi.vercel.app%2Fdocs-c9a962?style=for-the-badge&logo=readthedocs&logoColor=white&bg_color=1a1d21" alt="Documentation" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&bg_color=1a1d21" alt="MIT License" />
  <img src="https://img.shields.io/github/stars/DanielDeshmukh/proteus?style=for-the-badge&color=c9a962&bg_color=1a1d21" alt="Stars" />
  <img src="https://img.shields.io/github/issues/DanielDeshmukh/proteus?style=for-the-badge&bg_color=1a1d21" alt="Issues" />
</p>

---

> ⭐ **If PROTEUS gave you a smarter way to think about resume optimization — a star helps other engineers find it. Takes 2 seconds.**

---

## What it does

PROTEUS is a JD-aware resume analyzer that runs a **five-agent pipeline powered by Groq with Google Gemini fallback** to produce consistent, actionable outputs from a single job description and resume.

| Output | What you get |
|--------|-------------|
| **Match Score** | Percentage alignment with category breakdown |
| **Gap Analysis** | Matched / partial / missing requirements ranked by impact |
| **Bullet Rewrites** | JD-aware rewrites with rationale and impact scores |
| **Tailored Resume** | ATS-safe export (TXT, Word, PDF) built from accepted rewrites |
| **Cover Letter** | Tailored letter from the same parsed context |
| **Priority Actions** | Ranked steps to improve your application |

Every output reads from the same parsed JD context — no contradictions between your score, gaps, rewrites, and cover letter.

## How it works

```
JD ──┐
     ├──→ [Parse] → [Match] → [Rewrite] → [Draft] ──→ Results
Resume┘
```

| Step | Agent | Model | Task |
|------|-------|-------|------|
| 01 | JD Parser | `openai/gpt-oss-120b` (Groq) | Extract role, requirements, seniority |
| 02 | Resume Parser | `openai/gpt-oss-120b` (Groq) | Extract skills, experience, achievements |
| 03 | Gap Analyzer | Local (no LLM) | Exact + word-level requirement matching |
| 04 | Rewriter | `openai/gpt-oss-120b` (Groq) | JD-aware bullet rewrites |
| 05 | Cover Letter | `openai/gpt-oss-120b` (Groq) | Tailored letter generation |

> Models auto-update via GitHub Actions health checks every 3 hours.

<!-- MODELS AUTO-GENERATED START -->
### Active Models (auto-updated by health check bot)

| Role | Model | Last Checked |
|------|-------|--------------|
| jd-parser | `openai/gpt-oss-120b` | 2026-09-30T10:36:12.387Z |
| resume-parser | `openai/gpt-oss-120b` | 2026-09-30T10:36:12.387Z |
| gap-analyzer | `openai/gpt-oss-120b` | 2026-09-30T10:36:12.387Z |
| rewrite-suggester | `openai/gpt-oss-120b` | 2026-09-30T10:36:12.387Z |
| cover-letter | `openai/gpt-oss-120b` | 2026-09-30T10:36:12.387Z |
<!-- END MODELS AUTO-GENERATED -->

## Features

<details>
<summary><strong>Core Analysis</strong></summary>

- 3 ways to input a JD: paste, upload, or URL
- 2 ways to input a resume: paste or file upload (.pdf, .docx, .txt)
- Requirement match scoring (deterministic exact + word-level matching)
- Gap analysis ranked by impact with severity badges
- Bullet-level rewrite suggestions with before/after comparison
- Consistent cover letter generated from the same context
- Priority action items ranked by impact

</details>

<details>
<summary><strong>Platform</strong></summary>

- Per-user data isolation and analysis history
- Rate limiting (10 analyses/day)
- Streaming API (NDJSON) for real-time pipeline progress
- Mobile-responsive UI
- Dark theme with gold accent design system
- Three auth methods: magic link, Google, GitHub

</details>

<details>
<summary><strong>Reliability</strong></summary>

- Automatic model fallback on failure
- JSON retry with temperature escalation (3 attempts)
- 300s timeout on serverless functions
- Health checks every 3 hours via GitHub Actions
- Self-healing model registry (auto-replaces failed models)

</details>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 · App Router · TypeScript |
| Styling | Tailwind CSS v4 · Dark theme · Geist fonts |
| AI/ML | Groq (GPT-OSS 120B) · Google Gemini fallback |
| Database | better-sqlite3 (local) · Turso/libsql (Vercel) |
| Auth | NextAuth.js v5 · Magic Link · Google · GitHub |
| Validation | Zod v4 |
| PDF Parsing | unpdf |
| Deployment | Vercel · GitHub Actions |
| Rate Limiting | Custom per-user daily limits |

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Run full pipeline |
| `/api/analyze/stream` | POST | Run pipeline with NDJSON streaming |
| `/api/history` | GET | List past runs |
| `/api/history/:id` | GET | Get run details |
| `/api/history/:id` | DELETE | Delete a run |
| `/api/models` | GET | List configured models |
| `/api/health` | GET | Health check |
| `/api/health/models` | GET | Model connectivity test for all pipeline steps |
| `/api/usage` | GET | Daily usage stats |

---

<p align="center">
  <strong>Built by <a href="https://github.com/DanielDeshmukh">Daniel Deshmukh</a> · Mumbai, India</strong>
</p>

<p align="center">
  <a href="https://proteus-phi.vercel.app">
    <img src="https://img.shields.io/badge/TRY_PROTEUS_NOW-76b900?style=for-the-badge&logo=vercel&logoColor=white&bg_color=1a1d21" alt="Try PROTEUS" />
  </a>
</p>
