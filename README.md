<p align="center">
  <img src="banner.png" alt="PROTEUS" width="100%" />
</p>

<h1 align="center">PROTEUS</h1>

<p align="center">
  <strong>One pipeline. One JD. Every output stays consistent.</strong>
</p>

<p align="center">
  <a href="https://proteus-phi.vercel.app">
    <img src="https://img.shields.io/badge/LIVE_APP-proteus--phi.vercel.app-76b900?style=for-the-badge&logo=vercel&logoColor=white" alt="Live App" />
  </a>
  <a href="https://proteus-phi.vercel.app/docs">
    <img src="https://img.shields.io/badge/DOCS-proteus--phi.vercel.app%2Fdocs-c9a962?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NVIDIA_NIM-LLaMA_3.1_70B-76b900?style=flat-square&logo=nvidia&logoColor=white" alt="NVIDIA NIM" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-22c55e?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Models-5_healthy-76b900?style=flat-square" alt="Models" />
  <img src="https://img.shields.io/badge/Pipeline-5_agents-c9a962?style=flat-square" alt="Pipeline" />
  <img src="https://img.shields.io/badge/Rate_Limit-10%2Fday-f59e0b?style=flat-square" alt="Rate Limit" />
  <img src="https://img.shields.io/badge/Auth-3_providers-8b5cf6?style=flat-square" alt="Auth" />
  <img src="https://img.shields.io/github/stars/DanielDeshmukh/proteus?style=flat-square&color=c9a962" alt="Stars" />
  <img src="https://img.shields.io/github/last-commit/DanielDeshmukh/proteus?style=flat-square" alt="Last Commit" />
  <img src="https://img.shields.io/github/issues/DanielDeshmukh/proteus?style=flat-square" alt="Issues" />
</p>

---

> ⭐ **If PROTEUS gave you a smarter way to think about resume optimization — a star helps other engineers find it. Takes 2 seconds.**

---

## What it does

PROTEUS is a JD-aware resume analyzer that runs a **five-agent NVIDIA NIM pipeline** to produce consistent, actionable outputs from a single job description and resume.

| Output | What you get |
|--------|-------------|
| **Semantic Match Score** | Percentage alignment with category breakdown |
| **Gap Analysis** | Matched / partial / missing requirements ranked by impact |
| **Bullet Rewrites** | JD-aware rewrites with rationale and impact scores |
| **Cover Letter** | Tailored letter from the same parsed context |
| **Priority Actions** | Ranked steps to improve your application |

Every output reads from the same parsed JD context — no contradictions between your score, gaps, rewrites, and cover letter.

## How it works

```
JD ──┐
     ├──→ [Parse] → [Calibrate] → [Map] → [Rewrite] → [Draft] ──→ Results
Resume┘
```

| Step | Agent | Model | Task |
|------|-------|-------|------|
| 01 | JD Parser | `meta/llama-3.1-70b-instruct` | Extract role, requirements, seniority |
| 02 | Resume Parser | `meta/llama-3.1-70b-instruct` | Extract skills, experience, achievements |
| 03 | Gap Analyzer | `nvidia/nv-embedqa-e5-v5` | Semantic similarity scoring |
| 04 | Rewriter | `meta/llama-3.1-70b-instruct` | JD-aware bullet rewrites |
| 05 | Cover Letter | `meta/llama-3.1-70b-instruct` | Tailored letter generation |

> Models auto-update via GitHub Actions health checks every 6 hours.

<!-- MODELS AUTO-GENERATED START -->
### Active Models (auto-updated)

| Role | Model | Last Checked |
|------|-------|--------------|
| jd-parser | `meta/llama-3.1-70b-instruct` | auto |
| resume-parser | `meta/llama-3.1-70b-instruct` | auto |
| gap-analyzer | `nvidia/nv-embedqa-e5-v5` | auto |
| rewrite-suggester | `meta/llama-3.1-70b-instruct` | auto |
| cover-letter | `meta/llama-3.1-70b-instruct` | auto |
<!-- END MODELS AUTO-GENERATED -->

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 · App Router · TypeScript |
| Styling | Tailwind CSS v4 · Dark theme · Geist fonts |
| AI/ML | NVIDIA NIM · LLaMA 3.1 70B · Embeddings |
| Database | better-sqlite3 (local) · Turso/libsql (Vercel) |
| Auth | NextAuth.js v5 · Magic Link · Google · GitHub |
| Validation | Zod v4 |
| PDF Parsing | unpdf |
| Deployment | Vercel · GitHub Actions |
| Rate Limiting | Custom per-user daily limits |

## Features

<details>
<summary><strong>Core Analysis</strong></summary>

- 3 ways to input a JD: paste, upload, or URL
- 2 ways to input a resume: paste or PDF upload
- Semantic match scoring (embedding-based, not keyword matching)
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
- Health checks every 6 hours via GitHub Actions
- Self-healing model registry (auto-replaces failed models)

</details>

## Getting Started

```bash
git clone https://github.com/DanielDeshmukh/proteus.git
cd proteus/proteus-next
npm install
cp .env.example .env    # add your NVIDIA_NIM_API_KEY
npm run dev             # http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_NIM_API_KEY` | Yes | NVIDIA NIM API key |
| `DATABASE_URL` | Vercel | Turso/libsql URL |
| `DATABASE_AUTH_TOKEN` | Vercel | Turso auth token |
| `AUTH_SECRET` | Yes | NextAuth.js secret |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth |
| `SMTP_HOST` | Optional | Email magic links |
| `SMTP_PORT` | Optional | Email magic links |
| `SMTP_USER` | Optional | Email magic links |
| `SMTP_PASS` | Optional | Email magic links |
| `EMAIL_FROM` | Optional | Sender address |

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Set root directory to `proteus-next`
4. Add environment variables
5. Deploy

**Why Vercel?** PROTEUS uses better-sqlite3 locally and Turso/libsql on Vercel. The database layer auto-detects the environment.

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Run full pipeline |
| `/api/analyze/stream` | POST | Run pipeline with SSE streaming |
| `/api/history` | GET | List past runs |
| `/api/history/:id` | GET | Get run details |
| `/api/history/:id` | DELETE | Delete a run |
| `/api/models` | GET | List configured models |
| `/api/health` | GET | Health check |
| `/api/health/nim` | GET | NIM connectivity test |
| `/api/usage` | GET | Daily usage stats |

---

<p align="center">
  <strong>Built by <a href="https://github.com/DanielDeshmukh">Daniel Deshmukh</a> · Mumbai, India</strong>
</p>

<p align="center">
  <a href="https://proteus-phi.vercel.app">
    <img src="https://img.shields.io/badge/TRY_PROTEUS_NOW-76b900?style=for-the-badge&logo=vercel&logoColor=white" alt="Try PROTEUS" />
  </a>
</p>
