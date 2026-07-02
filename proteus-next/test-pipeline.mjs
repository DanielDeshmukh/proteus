// proteus-next/test-pipeline.mjs — Full pipeline integration test
import { writeFileSync, appendFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const BASE = "http://localhost:3000";
const LOG_FILE = join(process.cwd(), "test-results.log");

function log(section, data) {
  const line = `\n${"=".repeat(70)}\n[${section}]\n${"=".repeat(70)}\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}\n`;
  appendFileSync(LOG_FILE, line);
  process.stdout.write(line);
}

// ── Sample JDs (real, from web) ──────────────────────────────

const JDs = [
  {
    name: "Google — Senior Software Engineer, Cloud",
    text: `Google — Senior Software Engineer, Cloud Platform

Location: Mountain View, CA (Hybrid)
Team: Google Cloud, Infrastructure

About the Role:
We're looking for a Senior Software Engineer to join Google Cloud's infrastructure team. You'll design and build large-scale distributed systems that power Google Cloud's core services.

Requirements:
- 5+ years of software development experience
- Strong proficiency in Go, Python, or Java
- Experience with distributed systems architecture (microservices, gRPC, pub/sub)
- Hands-on experience with Kubernetes and container orchestration
- Understanding of cloud infrastructure (compute, storage, networking)
- Experience with CI/CD pipelines and infrastructure-as-code (Terraform, Pulumi)
- Strong understanding of networking protocols (TCP/IP, HTTP/2, gRPC)
- Experience with observability (Prometheus, Grafana, OpenTelemetry)

Nice to Have:
- Experience with large-scale data processing (Spark, Flink, Beam)
- Contributions to open-source infrastructure projects
- Experience with GPU computing and ML infrastructure
- Knowledge of Site Reliability Engineering (SRE) practices

Qualifications:
- BS/MS in Computer Science or equivalent practical experience
- Published research or patents in distributed systems a plus`,
  },
  {
    name: "Stripe — Backend Engineer, Payments",
    text: `Stripe — Backend Engineer, Payments Platform

Location: Remote (US/EU)
Team: Payments Core

About the Role:
Join Stripe's Payments team to build and scale the financial infrastructure that powers millions of businesses worldwide. You'll work on systems that process billions of dollars in transactions.

Requirements:
- 3+ years of backend development experience
- Strong proficiency in Ruby, Python, or Go
- Experience building and operating high-availability services (99.99%+ uptime)
- Deep understanding of database systems (PostgreSQL, Redis, DynamoDB)
- Experience with event-driven architectures and message queues (Kafka, SQS)
- Knowledge of financial systems, payments, or fintech is a strong plus
- Familiarity with API design best practices (REST, versioning, pagination)
- Experience with fraud detection systems or risk scoring

Nice to Have:
- Experience with PCI DSS compliance
- Knowledge of payment rails (ACH, SWIFT, card networks)
- Experience building real-time transaction monitoring systems
- Familiarity with regulatory requirements (SOX, GDPR)

Qualifications:
- BS in Computer Science or equivalent experience`,
  },
  {
    name: "Netflix — Senior Full-Stack Engineer",
    text: `Netflix — Senior Full-Stack Engineer

Location: Los Gatos, CA (Hybrid)
Team: Content Discovery

About the Role:
Help build the content discovery experience used by 250M+ subscribers worldwide. You'll work across the stack to build features that help members find content they'll love.

Requirements:
- 5+ years of full-stack development experience
- Strong proficiency in React and TypeScript
- Backend experience with Node.js or Java
- Experience with A/B testing frameworks and experimentation platforms
- Understanding of recommendation systems concepts
- Experience with responsive design and accessibility (WCAG 2.1)
- Proficiency with GraphQL and REST APIs
- Experience with performance optimization (Core Web Vitals, lazy loading)

Nice to Have:
- Experience with machine learning model serving
- Knowledge of personalization algorithms
- Experience with feature flag systems
- Familiarity with Chromecast, smart TV, or mobile app development

Qualifications:
- BS/MS in Computer Science or equivalent practical experience
- Portfolio of shipped products preferred`,
  },
  {
    name: "Anthropic — ML Engineer, Alignment",
    text: `Anthropic — ML Engineer, Alignment Research

Location: San Francisco, CA (On-site)
Team: Alignment Science

About the Role:
Work on Anthropic's alignment research to make AI systems safe and beneficial. You'll develop techniques to understand, measure, and improve the behavior of large language models.

Requirements:
- 3+ years of machine learning engineering experience
- Strong proficiency in Python and PyTorch
- Experience training and fine-tuning large language models
- Understanding of transformer architecture and attention mechanisms
- Experience with reinforcement learning from human feedback (RLHF)
- Familiarity with constitutional AI and AI safety concepts
- Strong mathematical foundations (linear algebra, probability, optimization)
- Experience with distributed training (DeepSpeed, FSDP, Megatron)

Nice to Have:
- Published research in AI safety, alignment, or interpretability
- Experience with red-teaming and adversarial testing of LLMs
- Knowledge of information theory and causal inference
- Experience with evaluation frameworks for AI systems

Qualifications:
- MS/PhD in Machine Learning, AI, or related field
- Research publications preferred`,
  },
  {
    name: "Figma — Design Systems Engineer",
    text: `Figma — Design Systems Engineer

Location: San Francisco, CA (Hybrid)
Team: Design Systems

About the Role:
Build and maintain Figma's internal design system used by product teams to ship consistent, accessible, and performant user interfaces across the product.

Requirements:
- 3+ years of frontend development experience
- Expert-level proficiency in TypeScript and React
- Deep understanding of CSS (layouts, animations, custom properties)
- Experience building and maintaining component libraries
- Strong understanding of accessibility (WCAG 2.1 AA compliance)
- Experience with design tokens and theming systems
- Proficiency with testing (unit, visual regression, accessibility)
- Understanding of performance budgets and bundle optimization

Nice to Have:
- Experience with Web Components or Shadow DOM
- Knowledge of design tools (Figma, Sketch APIs)
- Experience with server-side rendering and streaming
- Familiarity with Canvas API or WebGL
- Experience building editor-like interfaces

Qualifications:
- BS in Computer Science or equivalent practical experience
- Open-source contributions welcome`,
  },
];

// ── Sample Resumes (realistic) ──────────────────────────────

const RESUMES = [
  {
    name: "Jane Smith — Backend/Distributed Systems",
    text: `Jane Smith
jane.smith@email.com | (415) 555-0142 | San Francisco, CA
linkedin.com/in/janesmith | github.com/janesmith

SUMMARY
Senior software engineer with 7 years of experience building distributed systems and cloud infrastructure. Previously at Meta and AWS. Passionate about building reliable, scalable backend systems.

EXPERIENCE

Senior Software Engineer — Meta (2021-2024)
- Led migration of 200+ microservices from ECS to Kubernetes, reducing deployment time by 60%
- Built real-time data pipeline processing 1M events/sec using Kafka and Flink
- Designed and implemented distributed caching layer serving 10K RPS with 99.99% uptime
- Reduced API latency by 40% through connection pooling and query optimization
- Mentored 3 junior engineers and led weekly architecture review sessions

Software Engineer — Amazon Web Services (2018-2021)
- Developed auto-scaling algorithms for EC2 instances that reduced costs by 25%
- Built internal monitoring dashboards using Prometheus and Grafana
- Implemented circuit breaker patterns for cross-region service communication
- Contributed to AWS SDK for Python (boto3) — 3 merged PRs

EDUCATION
MS Computer Science — Stanford University (2018)
BS Computer Science — UC Berkeley (2016)

SKILLS
Python, Go, Java, Kubernetes, Docker, Terraform, AWS, GCP, PostgreSQL, Redis, Kafka, Flink, gRPC, Prometheus, Grafana, CI/CD, Git

CERTIFICATIONS
- AWS Solutions Architect Professional
- Certified Kubernetes Administrator (CKA)`,
  },
  {
    name: "Alex Johnson — Full-Stack / React",
    text: `Alex Johnson
alex.j@outlook.com | (650) 555-0198 | Los Angeles, CA
alexjohnson.dev | github.com/alexj

SUMMARY
Full-stack engineer with 6 years of experience building consumer-facing web applications. Expert in React/TypeScript with a track record of shipping features used by millions.

EXPERIENCE

Senior Frontend Engineer — Spotify (2022-2024)
- Led the redesign of the playlist discovery feature, increasing engagement by 18%
- Built A/B testing framework that reduced experiment cycle time from 2 weeks to 3 days
- Implemented real-time collaborative playlist editing using WebSockets
- Optimized Core Web Vitals: LCP reduced from 3.2s to 1.1s, CLS from 0.15 to 0.02
- Created shared component library (50+ components) used across 4 product teams

Frontend Engineer — Airbnb (2020-2022)
- Built the search results page redesign serving 100M+ monthly visitors
- Implemented progressive image loading reducing bandwidth by 35%
- Developed accessibility-first component patterns (WCAG 2.1 AA compliant)
- Led migration from JavaScript to TypeScript across 120K LOC

Junior Developer — Startup (2018-2020)
- Built full-stack features for a B2B SaaS platform using React, Node.js, PostgreSQL
- Implemented Stripe integration processing $2M+ in monthly transactions

EDUCATION
BS Computer Science — UCLA (2018)

SKILLS
React, TypeScript, JavaScript, Next.js, Node.js, GraphQL, REST APIs, PostgreSQL, Redis, WebSockets, Jest, Cypress, Playwright, CSS-in-JS, Figma, Git, Vercel, AWS

CERTIFICATIONS
- Meta Front-End Developer Professional Certificate`,
  },
  {
    name: "Sam Rivera — ML/AI Engineer",
    text: `Sam Rivera
sam.rivera@gmail.com | (408) 555-0167 | San Francisco, CA
samrivera.ml | github.com/samrivera | scholar.google.com/citations?user=samr

SUMMARY
Machine learning engineer with 4 years of experience in NLP and large language model training/fine-tuning. Published researcher in AI safety with 2 papers at NeurIPS.

EXPERIENCE

ML Engineer — Cohere (2023-2024)
- Fine-tuned LLMs for enterprise RAG applications, improving retrieval accuracy by 22%
- Built evaluation framework for measuring hallucination rates across model variants
- Implemented RLHF training pipeline using PyTorch and DeepSpeed ZeRO-3
- Reduced inference latency by 35% through quantization (INT8/INT4) and KV-cache optimization
- Red-teamed LLMs for safety, discovering 3 novel jailbreak techniques

Research Engineer — Scale AI (2022-2023)
- Built data annotation pipelines for RLHF reward model training
- Developed quality scoring algorithms for human preference data
- Implemented constitutional AI techniques for alignment research
- Contributed to open-source evaluation benchmarks for LLM safety

ML Intern — Google DeepMind (2021)
- Researched interpretability techniques for transformer attention patterns
- Published paper: "Attention Is Not Explanation" (NeurIPS 2021 Workshop)
- Built tooling for visualizing neuron activation patterns in large models

EDUCATION
MS Machine Learning — Carnegie Mellon University (2021)
BS Mathematics & Computer Science — MIT (2019)

SKILLS
Python, PyTorch, TensorFlow, JAX, CUDA, DeepSpeed, FSDP, Transformers, RLHF, Constitutional AI, NLP, LLM Training, Distributed Training, Kubernetes, Docker, Git

PUBLICATIONS
- "Attention Is Not Explanation" — NeurIPS 2021 Workshop on Trustworthy ML
- "Measuring Alignment: A Framework for Evaluating RLHF Effectiveness" — NeurIPS 2023`,
  },
];

// ── Tests ───────────────────────────────────────────────────

async function testHealth() {
  const res = await fetch(`${BASE}/api/health`);
  const data = await res.json();
  log("TEST: /api/health", { status: res.status, ...data });
  return res.ok;
}

async function testAnalyzePaste(jd, resume) {
  const formData = new FormData();
  formData.append("jd_text", jd.text);
  formData.append("resume_text", resume.text);

  const start = Date.now();
  const res = await fetch(`${BASE}/api/analyze`, { method: "POST", body: formData });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const data = await res.json();

  log(`TEST: /api/analyze — ${jd.name} vs ${resume.name} (${elapsed}s)`, {
    status: res.status,
    run_id: data.run_id,
    overall_score: data.overall_score,
    section_scores: data.section_scores,
    gap_count: data.gap_analysis?.gaps?.length ?? 0,
    matched: data.gap_analysis?.matched_count,
    partial: data.gap_analysis?.partial_count,
    missing: data.gap_analysis?.missing_count,
    rewrite_count: data.rewrite_suggestions?.suggestions?.length ?? 0,
    hidden_experience: data.rewrite_suggestions?.hidden_experience,
    cover_letter_word_count: data.cover_letter?.word_count,
    cover_letter_tone: data.cover_letter?.tone,
    cover_letter_sections: data.cover_letter?.sections?.map(s => s.heading),
    action_count: data.action_list?.length ?? 0,
    actions: data.action_list?.map(a => `[P${a.priority}] ${a.action} (${a.impact})`),
    timings: data.timings,
    errors: data.errors,
  });

  return { res, data };
}

async function testStream(jd, resume) {
  const formData = new FormData();
  formData.append("jd_text", jd.text);
  formData.append("resume_text", resume.text);

  const start = Date.now();
  const res = await fetch(`${BASE}/api/analyze/stream`, { method: "POST", body: formData });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const events = [];
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.trim()) {
        try {
          const evt = JSON.parse(line);
          events.push(evt);
        } catch {}
      }
    }
  }

  log(`TEST: /api/analyze/stream — ${jd.name} vs ${resume.name} (${elapsed}s)`, {
    status: res.status,
    total_events: events.length,
    event_types: events.map(e => e.event),
    started: events.find(e => e.event === "started"),
    done: events.find(e => e.event === "done"),
    result_score: events.find(e => e.event === "result")?.data?.overall_score,
    errors: events.filter(e => e.event === "error"),
  });

  return events;
}

async function testHistory() {
  const res = await fetch(`${BASE}/api/history?limit=10`);
  const data = await res.json();
  log("TEST: /api/history", { status: res.status, count: data.count, runs: data.runs?.map(r => ({ id: r.id, score: r.overall_score, status: r.status })) });
  return data;
}

async function testHistoryById(id) {
  const res = await fetch(`${BASE}/api/history/${id}`);
  const data = await res.json();
  log(`TEST: /api/history/${id}`, { status: res.status, id: data.id, score: data.overall_score, status: data.status });
  return data;
}

async function testHistoryDelete(id) {
  const res = await fetch(`${BASE}/api/history/${id}`, { method: "DELETE" });
  const data = await res.json();
  log(`TEST: DELETE /api/history/${id}`, { status: res.status, ...data });
  return data;
}

async function testErrors() {
  // Empty JD
  const r1 = await fetch(`${BASE}/api/analyze`, {
    method: "POST",
    body: (() => { const f = new FormData(); f.append("jd_text", ""); f.append("resume_text", "test"); return f; })(),
  });
  const d1 = await r1.json();
  log("TEST: Error — empty JD", { status: r1.status, detail: d1.detail });

  // No resume
  const r2 = await fetch(`${BASE}/api/analyze`, {
    method: "POST",
    body: (() => { const f = new FormData(); f.append("jd_text", "test JD"); return f; })(),
  });
  const d2 = await r2.json();
  log("TEST: Error — no resume", { status: r2.status, detail: d2.detail });

  // Invalid history ID
  const r3 = await fetch(`${BASE}/api/history/99999`);
  const d3 = await r3.json();
  log("TEST: Error — invalid history ID", { status: r3.status, detail: d3.detail });
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  writeFileSync(LOG_FILE, `PROTEUS Pipeline Test — ${new Date().toISOString()}\n`);
  const t0 = Date.now();

  log("CONFIG", { base_url: BASE, jd_count: JDs.length, resume_count: RESUMES.length });

  // 1. Health
  await testHealth();

  // 2. Error cases (no API needed)
  await testErrors();

  // 3. Full pipeline tests — all JD x Resume combos
  const runIds = [];
  for (const jd of JDs) {
    for (const resume of RESUMES) {
      try {
        const { data } = await testAnalyzePaste(jd, resume);
        if (data.run_id) runIds.push(data.run_id);
      } catch (e) {
        log(`ERROR: ${jd.name} vs ${resume.name}`, e.message);
      }
    }
  }

  // 4. Streaming test (first combo only)
  try {
    await testStream(JDs[0], RESUMES[0]);
  } catch (e) {
    log("ERROR: Stream test", e.message);
  }

  // 5. History tests
  const history = await testHistory();
  if (history.runs?.length > 0) {
    await testHistoryById(history.runs[0].id);
  }

  const total = ((Date.now() - t0) / 1000).toFixed(1);
  log("SUMMARY", { total_seconds: total, tests_run: JDs.length * RESUMES.length + 5, run_ids: runIds });

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
