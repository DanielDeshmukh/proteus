"use client";

import { useEffect, useState } from "react";
import { SiNvidia } from "react-icons/si";

function Section({ id, title, icon, children }: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: "56px", scrollMarginTop: "32px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "24px", color: "var(--text)", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
        {icon && <span style={{ color: "#76b900", display: "flex", alignItems: "center" }}>{icon}</span>}
        {title}
      </h2>
      <div style={{ fontSize: "14.5px", color: "var(--text-soft)", lineHeight: 1.8 }}>
        {children}
      </div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--color-gold-light)", marginBottom: "10px" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 12px" }}>{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontFamily: "var(--font-mono)", fontSize: "13px", background: "var(--surface-sunken)", border: "1px solid var(--border)", borderRadius: "4px", padding: "2px 6px", color: "var(--color-gold)" }}>
      {children}
    </code>
  );
}

function InfoBox({ children, variant = "info" }: { children: React.ReactNode; variant?: "info" | "warn" | "tip" }) {
  const styles: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.2)", icon: "ℹ" },
    warn: { bg: "rgba(201,169,98,0.06)", border: "rgba(201,169,98,0.2)", icon: "⚠" },
    tip: { bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.2)", icon: "✓" },
  };
  const s = styles[variant];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: "16px", fontSize: "13px", lineHeight: 1.7 }}>
      <span style={{ marginRight: "8px" }}>{s.icon}</span>
      {children}
    </div>
  );
}

function List({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={{ margin: "0 0 16px", paddingLeft: "24px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: "6px" }}>{item}</li>
      ))}
    </Tag>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: "16px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--color-gold)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-soft)" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  const [modelRows, setModelRows] = useState<string[][]>([
    ["JD Parser", "Loading...", "Parse job descriptions into structured requirements"],
    ["Resume Parser", "Loading...", "Extract structured data from resume text"],
    ["Gap Analyzer", "Loading...", "Generate embeddings for semantic similarity scoring"],
    ["Rewriter", "Loading...", "Rewrite resume bullets to match JD requirements"],
    ["Cover Letter", "Loading...", "Generate tailored cover letters"],
  ]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }

    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) {
          setModelRows(
            data.models.map((m: { agent: string; model: string; task: string }) => [
              m.agent,
              m.model,
              m.task,
            ])
          );
          setLastChecked(data.lastHealthCheck);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "48px 40px 120px" }} className="docs-content">
      {/* Hero */}
      <div style={{ marginBottom: "48px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "12px" }}>
          Documentation
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.2, color: "var(--text)", marginBottom: "16px" }}>
          PROTEUS User Guide
        </h1>
        <p style={{ fontSize: "15px", color: "var(--text-soft)", lineHeight: 1.7, maxWidth: "560px" }}>
          Everything you need to know about using PROTEUS — from signing in to understanding your analysis results.
        </p>
      </div>

      {/* ─── Introduction ─────────────────────────────── */}
      <Section id="introduction" title="Introduction">
        <P>
          PROTEUS is an AI-powered resume analyzer that compares your resume against a job description and returns actionable insights. It uses a five-agent pipeline powered by NVIDIA NIM models to deliver consistent, JD-aware results.
        </P>

        <SubSection title="What you get">
          <List items={[
            "Semantic match score — how closely your resume aligns with the role",
            "Gap analysis — specific requirements you're missing or partially matching",
            "Bullet-level rewrites — JD-aware suggestions to strengthen weak experience items",
            "Cover letter — a tailored letter written from the same context as your resume",
            "Priority actions — ranked steps to improve your application",
          ]} />
        </SubSection>

        <SubSection title="How it's different">
          <P>
            Unlike generic resume scanners, PROTEUS processes everything through a single pipeline with shared JD context. Each agent sees the same parsed job description, so your score, gap analysis, rewrites, and cover letter all reference the same requirements — no contradictions.
          </P>
        </SubSection>
      </Section>

      {/* ─── Getting Started ──────────────────────────── */}
      <Section id="getting-started" title="Getting Started">
        <SubSection title="1. Sign in">
          <P>Visit <Code>proteus-phi.vercel.app</Code> and sign in with any of these methods:</P>
          <List items={[
            "Magic link — enter your email, click the link we send you",
            "Google — one-click sign in with your Google account",
            "GitHub — one-click sign in with your GitHub account",
          ]} />
          <InfoBox variant="tip">
            Your first analysis is free. PROTEUS allows up to <strong>10 analyses per day</strong>.
          </InfoBox>
        </SubSection>

        <SubSection title="2. Add your job description">
          <P>On the Analyze page, you can provide a JD in three ways:</P>
          <List ordered items={[
            "Paste text — copy the full job posting and paste it into the text area",
            "Enter a URL — paste a link to the job posting (LinkedIn, Greenhouse, Lever, etc.)",
            "Upload a file — attach a .txt or .pdf file containing the JD",
          ]} />
        </SubSection>

        <SubSection title="3. Add your resume">
          <P>Provide your resume in one of two ways:</P>
          <List ordered items={[
            "Paste text — copy your resume content into the text area",
            "Upload a PDF — attach your resume as a .pdf file",
          ]} />
          <InfoBox variant="warn">
            Keep your resume under 8,000 characters for best results. Longer resumes may be truncated.
          </InfoBox>
        </SubSection>

        <SubSection title="4. Run the pipeline">
          <P>
            Click <strong>&quot;Run Proteus pipeline&quot;</strong>. The analysis typically takes 30–120 seconds depending on the complexity of your inputs. You&apos;ll see real-time progress as each agent completes.
          </P>
        </SubSection>
      </Section>

      {/* ─── User Guide ───────────────────────────────── */}
      <Section id="user-guide" title="User Guide">
        <SubSection title="Understanding your results">
          <P>After the pipeline completes, you&apos;ll see these sections in order:</P>

          <h4 style={{ color: "var(--text)", fontSize: "14px", margin: "16px 0 8px" }}>Match Score</h4>
          <P>
            A percentage showing overall alignment. Breakdown by category (technical skills, experience, education, etc.) is shown in a chart. Scores above 75% are strong matches; 50–75% is moderate; below 50% indicates significant gaps.
          </P>

          <h4 style={{ color: "var(--text)", fontSize: "14px", margin: "16px 0 8px" }}>Gap Analysis</h4>
          <P>
            Each requirement from the JD is classified as <strong>matched</strong> (you have it), <strong>partial</strong> (you have something related), or <strong>missing</strong> (not found in your resume). The similarity score shows how close your resume is to each requirement.
          </P>

          <h4 style={{ color: "var(--text)", fontSize: "14px", margin: "16px 0 8px" }}>Rewrite Suggestions</h4>
          <P>
            For weak bullets, PROTEUS suggests rewrites that incorporate JD keywords and quantify impact. Each suggestion includes the original text, the rewrite, a rationale, and an impact score showing how much it improves your match.
          </P>

          <h4 style={{ color: "var(--text)", fontSize: "14px", margin: "16px 0 8px" }}>Cover Letter</h4>
          <P>
            A tailored cover letter written from the same parsed context as your analysis. You can choose the tone (professional, friendly, confident) before running the pipeline. Use the copy or download buttons to export it.
          </P>

          <h4 style={{ color: "var(--text)", fontSize: "14px", margin: "16px 0 8px" }}>Priority Actions</h4>
          <P>
            Ranked action items telling you what to fix first for the biggest impact on your match score.
          </P>
        </SubSection>

        <SubSection title="Viewing past runs">
          <P>
            Go to the <strong>History</strong> page to see all your previous analyses. Click any run to view the full results again. You can search runs by JD text or source.
          </P>
        </SubSection>

        <SubSection title="Downloading results">
          <P>
            On the History detail page, use the <strong>Copy</strong> and <strong>Download</strong> buttons to export your cover letter as a text file. The filename follows the format <Code>FirstName_RoleName.txt</Code>.
          </P>
        </SubSection>
      </Section>

      {/* ─── Pipeline Architecture ────────────────────── */}
      <Section id="pipeline" title="Pipeline Architecture">
        <P>
          PROTEUS runs a five-agent pipeline where each agent is powered by a dedicated NVIDIA NIM model. The JD is parsed first, and its output is shared with all downstream agents.
        </P>

        <Table
          headers={["Step", "Agent", "What it does"]}
          rows={[
            ["01", "JD Parser", "Extracts role title, requirements, seniority level, and key skills from the job description"],
            ["02", "Resume Parser", "Extracts skills, experience, education, and achievements from your resume"],
            ["03", "Gap Analyzer", "Compares parsed JD requirements against resume items using semantic embeddings"],
            ["04", "Rewriter", "Drafts JD-aware rewrites for weak resume bullets to better match requirements"],
            ["05", "Cover Letter Writer", "Writes a tailored cover letter using the same JD context and resume data"],
          ]}
        />

        <InfoBox variant="info">
          All agents share the same parsed JD context. This ensures your score, gaps, rewrites, and cover letter are all consistent with each other.
        </InfoBox>

        <SubSection title="Fallback models">
          <P>
            If the primary model for a step is unavailable or returns invalid JSON, PROTEUS automatically retries with the same model (up to 3 times with increasing temperature), then falls back to alternative models configured in <Code>models.json</Code>.
          </P>
        </SubSection>
      </Section>

      {/* ─── NVIDIA NIM Models ────────────────────────── */}
      <Section id="models" title="NVIDIA NIM Models" icon={<SiNvidia size={24} />}>
        <P>
          PROTEUS uses NVIDIA NIM (NVIDIA Inference Microservices) for all AI operations. Each pipeline step uses a dedicated model.
        </P>

        <Table
          headers={["Role", "Model", "Purpose"]}
          rows={modelRows}
        />

        {lastChecked && (
          <p style={{ fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: "8px" }}>
            Last health check: {new Date(lastChecked).toLocaleString()}
          </p>
        )}

        <SubSection title="Model health checks">
          <P>
            A GitHub Actions workflow checks all models every 3 hours. If a model goes down, it&apos;s automatically replaced in <Code>models.json</Code>. The health check results are committed to the repository.
          </P>
        </SubSection>

        <SubSection title="Checking health from the app">
          <P>
            Go to the <strong>Models</strong> page and click <strong>&quot;Check NIM Health&quot;</strong> to run a live connectivity test against each pipeline step. You&apos;ll see latency and any error details.
          </P>
        </SubSection>

        <SubSection title="Know more about NVIDIA NIM">
          <P>
            NVIDIA NIM (NVIDIA Inference Microservices) provides optimized, production-ready containers for deploying AI models at scale. NIM delivers low-latency inference across NVIDIA GPUs with automatic batching, quantization, and tensor parallelism — making it ideal for real-time AI applications like PROTEUS.
          </P>
          <P>
            Key advantages of NIM:
          </P>
          <List items={[
            "Optimized inference — models are tuned for maximum throughput on NVIDIA GPUs",
            "OpenAI-compatible API — drop-in replacement for OpenAI-style requests",
            "Model catalog — access hundreds of pre-hosted models (Llama, Mistral, Nemotron, and more)",
            "Serverless endpoints — no infrastructure to manage, pay only for what you use",
            "Enterprise-grade — built-in security, compliance, and SLA guarantees",
          ]} />
          <div style={{ marginTop: "16px" }}>
            <a
              href="https://build.nvidia.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "rgba(118,185,0,0.1)",
                border: "1px solid rgba(118,185,0,0.3)",
                borderRadius: "var(--radius-md)",
                color: "#76b900",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                textDecoration: "none",
                transition: "all .15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(118,185,0,0.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(118,185,0,0.1)"; }}
            >
              <SiNvidia size={16} />
              Explore NVIDIA NIM at build.nvidia.com
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </a>
          </div>
          <P>
            You can also browse available models, test API endpoints, and get API keys directly from the NVIDIA build platform.
          </P>
        </SubSection>
      </Section>

      {/* ─── Rate Limits & Usage ──────────────────────── */}
      <Section id="rate-limits" title="Rate Limits & Usage">
        <P>
          PROTEUS enforces daily usage limits to keep costs manageable and ensure fair access for all users.
        </P>

        <Table
          headers={["Limit", "Count", "Resets"]}
          rows={[
            ["Analyses per day", "10", "Midnight UTC"],
          ]}
        />

        <SubSection title="How it works">
          <List items={[
            "Each successful pipeline run counts as 1 analysis",
            "Failed runs (errors, timeouts) do NOT count against your limit",
            "Your current usage is shown below the Analyze button",
            "The counter resets at midnight UTC every day",
          ]} />
        </SubSection>

        <SubSection title="What happens when you hit the limit">
          <P>
            You&apos;ll see a clear error message telling you how many analyses you&apos;ve used and when the limit resets. The Analyze button will be disabled until the next day.
          </P>
        </SubSection>

        <InfoBox variant="warn">
          Rate limits are enforced server-side. Attempting to bypass limits by creating multiple accounts is against the Terms of Service.
        </InfoBox>
      </Section>

      {/* ─── Tips & Best Practices ─────────────────────── */}
      <Section id="tips" title="Tips & Best Practices">
        <SubSection title="Writing effective resumes for AI analysis">
          <List items={[
            "Use clear, action-led bullet points (e.g. 'Led a team of 5 engineers' not 'Was responsible for team')",
            "Include measurable outcomes (percentages, dollar amounts, team sizes)",
            "Mirror keywords from the job description — AI scoring is heavily keyword-driven",
            "Keep formatting simple — avoid tables, columns, headers/footers, and graphics",
            "One page is ideal for most roles; two pages max for senior positions",
          ]} />
        </SubSection>

        <SubSection title="Getting the best JD input">
          <List items={[
            "Copy the full job posting, not just the title — more context = better analysis",
            "Include requirements, responsibilities, and nice-to-haves",
            "If the JD is behind a login, paste the text directly instead of using a URL",
            "For multi-role postings, specify which role you're applying for in the text",
          ]} />
        </SubSection>

        <SubSection title="Improving your score over time">
          <List items={[
            "Run analysis on the same JD after making changes to see your score improve",
            "Focus on 'missing' gaps first — they have the biggest impact on your score",
            "Use the rewrite suggestions as starting points, then personalize them",
            "Don't copy rewrites verbatim — hiring managers can spot AI-generated text",
          ]} />
        </SubSection>
      </Section>

      {/* ─── Troubleshooting ───────────────────────────── */}
      <Section id="troubleshooting" title="Troubleshooting">
        <SubSection title="Analysis fails with timeout">
          <P>
            The pipeline has a 300-second limit. If your inputs are very long, try trimming them. Resume should be under 8,000 characters; JD under 12,000 characters.
          </P>
        </SubSection>

        <SubSection title="Analysis returns no results">
          <P>
            This usually means the AI models returned invalid JSON. PROTEUS will automatically retry (up to 3 times) and fall back to alternative models. If it still fails, try simplifying your input text.
          </P>
        </SubSection>

        <SubSection title="PDF upload fails to extract text">
          <P>
            PROTEUS uses unpdf for PDF parsing. Some PDFs are image-based (scans) and contain no extractable text. If you have a scanned PDF, use an OCR tool first to convert it to text.
          </P>
        </SubSection>

        <SubSection title="Score seems wrong or too low">
          <P>
            The score measures semantic similarity, not formatting quality. A low score usually means your resume doesn&apos;t contain the keywords the JD is looking for. Check the gap analysis section for specific missing requirements.
          </P>
        </SubSection>

        <SubSection title="Cover letter doesn't match the role">
          <P>
            The cover letter is generated from the same parsed context as your analysis. If the JD parser extracted the wrong role title or requirements, the cover letter will reflect that. Ensure your JD text is complete and accurate.
          </P>
        </SubSection>

        <SubSection title="NIM health check shows errors">
          <P>
            Go to the <strong>Models</strong> page and click <strong>&quot;Check NIM Health&quot;</strong>. If a model is down, PROTEUS will automatically use fallback models. You can also check the GitHub Actions health check results in the repository.
          </P>
        </SubSection>
      </Section>

      {/* ─── API Reference ─────────────────────────────── */}
      <Section id="api" title="API Reference">
        <P>
          PROTEUS exposes a REST API for programmatic access. All endpoints require authentication.
        </P>

        <Table
          headers={["Endpoint", "Method", "Description"]}
          rows={[
            ["/api/analyze", "POST", "Run the full pipeline (FormData: jd_text, resume_text, cover_letter_tone)"],
            ["/api/analyze/stream", "POST", "Run pipeline with SSE streaming events (same params)"],
            ["/api/history", "GET", "List your past analysis runs (?limit, ?offset)"],
            ["/api/history/:id", "GET", "Get a single run's full results"],
            ["/api/history/:id", "DELETE", "Delete a run"],
            ["/api/models", "GET", "List configured models and their roles"],
            ["/api/health", "GET", "Basic health check (returns ok)"],
            ["/api/health/nim", "GET", "NIM connectivity test for all pipeline steps"],
            ["/api/usage", "GET", "Your daily usage stats (used, limit, resetsAt)"],
          ]}
        />

        <InfoBox variant="info">
          All API endpoints return JSON. The <Code>/api/analyze/stream</Code> endpoint returns newline-delimited JSON (NDJSON) for real-time streaming.
        </InfoBox>
      </Section>

      {/* ─── FAQ ──────────────────────────────────────── */}
      <Section id="faq" title="FAQ">
        <SubSection title="Why did my analysis take so long?">
          <P>
            Each of the 5 agents makes an API call to NVIDIA NIM. Complex resumes or JDs with many requirements take longer. Typical runs are 30–120 seconds. If it exceeds 300 seconds, it times out automatically.
          </P>
        </SubSection>

        <SubSection title="Why is my score so low?">
          <P>
            The score reflects semantic similarity between your resume and the JD. A low score means the JD keywords and requirements aren&apos;t well represented in your resume. Use the rewrite suggestions and gap analysis to improve.
          </P>
        </SubSection>

        <SubSection title="Can I use PROTEUS without signing in?">
          <P>
            No. PROTEUS requires authentication to track your usage and save your analysis history. You can sign in with email, Google, or GitHub.
          </P>
        </SubSection>

        <SubSection title="Is my data private?">
          <P>
            Yes. Your resume and JD text are only used for the analysis. Results are stored in your account and only visible to you. We never share your data with third parties.
          </P>
        </SubSection>

        <SubSection title="What file formats are supported?">
          <P>
            JDs: paste text, URLs (LinkedIn, Greenhouse, Lever, etc.), or .txt/.pdf files. Resumes: paste text or .pdf files. The PDF parser uses unpdf for reliable text extraction.
          </P>
        </SubSection>

        <SubSection title="Why did I get an error about another sign-in method?">
          <P>
            If you try to sign in with a different method than the one you used before, you&apos;ll see a friendly message suggesting which provider to use. For example, if you signed up with Google, use Google again — not GitHub.
          </P>
        </SubSection>

        <SubSection title="How do I delete my account or data?">
          <P>
            You can delete individual analysis runs from the History page. For account deletion, contact support.
          </P>
        </SubSection>
      </Section>

      {/* ─── Changelog ────────────────────────────────── */}
      <Section id="changelog" title="Changelog">
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {[
            {
              version: "1.0.0",
              date: "July 2026",
              items: [
                "Initial release — five-agent AI pipeline",
                "Auth: magic link, Google, GitHub",
                "Per-user data isolation",
                "Rate limiting (10/day)",
                "Mobile responsive UI",
                "Dark-themed email templates",
                "Model health checks every 6 hours",
              ],
            },
          ].map((release) => (
            <div key={release.version} style={{ borderLeft: "2px solid var(--color-gold)", paddingLeft: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--color-gold)", fontWeight: 600 }}>
                  v{release.version}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-faint)" }}>
                  {release.date}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {release.items.map((item, i) => (
                  <li key={i} style={{ marginBottom: "4px", fontSize: "13.5px" }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
