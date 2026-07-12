"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
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
            Click <strong>"Run Proteus pipeline"</strong>. The analysis typically takes 30–120 seconds depending on the complexity of your inputs. You'll see real-time progress as each agent completes.
          </P>
        </SubSection>
      </Section>

      {/* ─── User Guide ───────────────────────────────── */}
      <Section id="user-guide" title="User Guide">
        <SubSection title="Understanding your results">
          <P>After the pipeline completes, you'll see these sections in order:</P>

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
          rows={[
            ["JD Parser", "meta/llama-3.1-70b-instruct", "Parse job descriptions into structured requirements"],
            ["Resume Parser", "meta/llama-3.1-70b-instruct", "Extract structured data from resume text"],
            ["Gap Analyzer", "nvidia/nv-embedqa-e5-v5", "Generate embeddings for semantic similarity scoring"],
            ["Rewriter", "meta/llama-3.1-70b-instruct", "Rewrite resume bullets to match JD requirements"],
            ["Cover Letter", "meta/llama-3.1-70b-instruct", "Generate tailored cover letters"],
          ]}
        />

        <SubSection title="Model health checks">
          <P>
            A GitHub Actions workflow checks all models every 6 hours. If a model goes down, it's automatically replaced in <Code>models.json</Code>. The health check results are committed to the repository.
          </P>
        </SubSection>

        <SubSection title="Checking health from the app">
          <P>
            Go to the <strong>Models</strong> page and click <strong>"Check NIM Health"</strong> to run a live connectivity test against each pipeline step. You'll see latency and any error details.
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
            You'll see a clear error message telling you how many analyses you've used and when the limit resets. The Analyze button will be disabled until the next day.
          </P>
        </SubSection>

        <InfoBox variant="warn">
          Rate limits are enforced server-side. Attempting to bypass limits by creating multiple accounts is against the Terms of Service.
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
            The score reflects semantic similarity between your resume and the JD. A low score means the JD keywords and requirements aren't well represented in your resume. Use the rewrite suggestions and gap analysis to improve.
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
            If you try to sign in with a different method than the one you used before, you'll see a friendly message suggesting which provider to use. For example, if you signed up with Google, use Google again — not GitHub.
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
