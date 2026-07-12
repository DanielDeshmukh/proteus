"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Spinner } from "@/components/Spinner";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { GapAnalysisDisplay } from "@/components/GapAnalysisDisplay";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";
import { apiGet } from "@/lib/api";

interface RunDetail {
  id: number;
  created_at: string;
  jd_text: string | null;
  jd_source: string | null;
  resume_text: string | null;
  resume_source: string | null;
  overall_score: number | null;
  section_scores: string | null;
  gap_analysis: string | null;
  rewrite_suggestions: string | null;
  cover_letter: string | null;
  action_list: string | null;
  status: string;
  error_message: string | null;
}

function SectionLabel({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "13px",
          color: "var(--color-gold)",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          margin: 0,
        }}
      >
        {children}
      </h3>
      {actions && <div>{actions}</div>}
    </div>
  );
}

function RawText({ text, maxLines = 40 }: { text: string; maxLines?: number }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n");
  const truncated = !expanded && lines.length > maxLines;
  const display = truncated ? lines.slice(0, maxLines).join("\n") : text;

  return (
    <div>
      <pre
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12.5px",
          lineHeight: "1.7",
          color: "var(--text-soft)",
          background: "var(--surface-sunken)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: 0,
          maxHeight: expanded ? "none" : "400px",
          overflow: "auto",
        }}
      >
        {display}
      </pre>
      {truncated && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            marginTop: "8px",
            background: "none",
            border: "none",
            color: "var(--color-gold)",
            fontSize: "12px",
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Show all {lines.length} lines...
        </button>
      )}
    </div>
  );
}

function RewriteCard({ s }: { s: { original_bullet: string; suggested_rewrite: string; rationale: string; target_requirement: string; impact_score: number } }) {
  return (
    <div
      style={{
        background: "var(--surface-sunken)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--color-gold)",
            background: "rgba(201, 169, 98, 0.10)",
            border: "1px solid rgba(201, 169, 98, 0.2)",
            borderRadius: "100px",
            padding: "2px 8px",
          }}
        >
          {Math.round(s.impact_score * 100)}% impact
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
          {s.target_requirement}
        </span>
      </div>
      <div>
        <p style={{ fontSize: "11px", color: "var(--text-faint)", marginBottom: "4px" }}>Original:</p>
        <p style={{ fontSize: "13px", color: "var(--text-soft)", textDecoration: "line-through", opacity: 0.7, margin: 0 }}>
          {s.original_bullet}
        </p>
      </div>
      <div>
        <p style={{ fontSize: "11px", color: "var(--color-gold)", marginBottom: "4px" }}>Suggested:</p>
        <p style={{ fontSize: "13px", color: "var(--text)", margin: 0 }}>
          {s.suggested_rewrite}
        </p>
      </div>
      <p style={{ fontSize: "12px", color: "var(--text-faint)", fontStyle: "italic", margin: 0 }}>
        {s.rationale}
      </p>
    </div>
  );
}

function dedupeGaps(gaps: Array<{ requirement: string; status: string; similarity_score: number; category: string; matched_evidence: string | null }>) {
  const seen = new Map<string, typeof gaps[0]>();
  for (const g of gaps) {
    const key = `${g.requirement.toLowerCase()}|${g.category}`;
    const existing = seen.get(key);
    if (!existing || g.similarity_score > existing.similarity_score) {
      seen.set(key, g);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.similarity_score - b.similarity_score);
}

export function HistoryDetail({ runId, onClose }: { runId: number; onClose: () => void }) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGet(`/api/history/${runId}`)
      .then((data) => { setRun(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [runId]);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/reports/pdf?run_id=${runId}`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proteus-report-${runId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}><Spinner size="lg" /></div>;
  if (error || !run) return <Card><p style={{ textAlign: "center", color: "var(--text-faint)", padding: "24px" }}>{error || "Run not found"}</p></Card>;

  let sectionScores: Record<string, number> | null = null;
  let gapAnalysis: { gaps: Array<{ status: string; requirement: string; similarity_score: number; category: string; matched_evidence: string | null }>; matched_count: number; partial_count: number; missing_count: number; total_requirements: number } | null = null;
  let rewriteSuggestions: { suggestions: Array<{ original_bullet: string; suggested_rewrite: string; rationale: string; target_requirement: string; impact_score: number; experience_context: string }>; hidden_experience: string[] } | null = null;
  let coverLetter: { full_letter: string; sections: Array<{ heading: string; content: string }>; word_count: number; tone: string; job_title?: string } | null = null;
  let actionList: Array<{ priority: number; action: string; impact: string; category: string }> | null = null;

  try { if (run.section_scores) sectionScores = JSON.parse(run.section_scores); } catch {}
  try { if (run.gap_analysis) gapAnalysis = JSON.parse(run.gap_analysis); } catch {}
  try { if (run.rewrite_suggestions) rewriteSuggestions = JSON.parse(run.rewrite_suggestions); } catch {}
  try { if (run.cover_letter) coverLetter = JSON.parse(run.cover_letter); } catch {}
  try { if (run.action_list) actionList = JSON.parse(run.action_list); } catch {}

  // Build cover letter filename: {username}_{applied_role}
  function sanitizeForFilename(s: string): string {
    return s.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_").substring(0, 50).replace(/_+$/, "");
  }
  const candidateName = run.resume_text?.split("\n").find((l: string) => l.trim().length > 2)?.trim() || "Candidate";
  const appliedRole = coverLetter?.job_title || "CoverLetter";
  const coverFilename = `${sanitizeForFilename(candidateName)}_${sanitizeForFilename(appliedRole)}`;

  // Dedupe gaps
  const dedupedGaps = gapAnalysis ? { ...gapAnalysis, gaps: dedupeGaps(gapAnalysis.gaps) } : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Back */}
      <button
        onClick={onClose}
        style={{
          alignSelf: "flex-start",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-soft)",
          padding: "8px 16px",
          fontSize: "13px",
          fontFamily: "var(--font-sans)",
          cursor: "pointer",
        }}
      >
        ← Back to History
      </button>

      {/* Header */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(17px, 3vw, 20px)", color: "var(--text)", margin: 0 }}>
              Run #{run.id}
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis" }}>
              {new Date(run.created_at).toLocaleString()} · {run.jd_source} JD · {run.resume_source} resume
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                background: pdfLoading ? "var(--surface-sunken)" : "rgba(201, 169, 98, 0.08)",
                border: "1px solid rgba(201, 169, 98, 0.2)",
                borderRadius: "var(--radius-md)",
                color: pdfLoading ? "var(--text-faint)" : "var(--color-gold)",
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                cursor: pdfLoading ? "wait" : "pointer",
                transition: "all .15s ease",
              }}
              onMouseEnter={(e) => { if (!pdfLoading) e.currentTarget.style.background = "rgba(201, 169, 98, 0.14)"; }}
              onMouseLeave={(e) => { if (!pdfLoading) e.currentTarget.style.background = "rgba(201, 169, 98, 0.08)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {pdfLoading ? "Generating..." : "Export PDF"}
            </button>
            {run.overall_score != null && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "24px", fontWeight: 600, color: "var(--color-gold-light)" }}>
                {Math.round(run.overall_score * 100)}%
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "100px",
                background: run.status === "completed" ? "rgba(201, 169, 98, 0.10)" : run.status === "partial" ? "rgba(201, 169, 98, 0.06)" : "rgba(220, 53, 69, 0.10)",
                color: run.status === "completed" || run.status === "partial" ? "var(--color-gold)" : "#ff6b6b",
                border: `1px solid ${run.status === "completed" ? "rgba(201, 169, 98, 0.2)" : run.status === "partial" ? "rgba(201, 169, 98, 0.15)" : "rgba(220, 53, 69, 0.2)"}`,
              }}
            >
              {run.status}
            </span>
          </div>
        </div>
      </Card>

      {/* Score */}
      {run.overall_score != null && (
        <Card>
          <SectionLabel>Match Score</SectionLabel>
          <ScoreDisplay score={run.overall_score} sectionScores={sectionScores} />
        </Card>
      )}

      {/* Gaps */}
      {dedupedGaps && (
        <Card>
          <SectionLabel>Gap Analysis</SectionLabel>
          <div style={{ display: "flex", gap: "14px", marginBottom: "18px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "var(--text-soft)" }}>
              Matched: <strong style={{ color: "var(--color-gold-light)" }}>{dedupedGaps.matched_count}</strong>
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-soft)" }}>
              Partial: <strong style={{ color: "var(--color-gold)" }}>{dedupedGaps.partial_count}</strong>
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-soft)" }}>
              Missing: <strong style={{ color: "#ff6b6b" }}>{dedupedGaps.missing_count}</strong>
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-faint)" }}>
              / {dedupedGaps.total_requirements} total
            </span>
          </div>
          <GapAnalysisDisplay gaps={dedupedGaps} />
        </Card>
      )}

      {/* Rewrites */}
      {rewriteSuggestions && rewriteSuggestions.suggestions.length > 0 && (
        <Card>
          <SectionLabel>Rewrite Suggestions ({rewriteSuggestions.suggestions.length})</SectionLabel>
          {rewriteSuggestions.hidden_experience.length > 0 && (
            <p style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "14px" }}>
              Hidden experience surfaced: {rewriteSuggestions.hidden_experience.join(", ")}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {rewriteSuggestions.suggestions.map((s, i) => (
              <RewriteCard key={i} s={s} />
            ))}
          </div>
        </Card>
      )}

      {/* Cover Letter */}
      {coverLetter && (
        <Card>
          <SectionLabel
            actions={
              <div style={{ display: "flex", gap: "8px" }}>
                <CopyButton text={coverLetter.full_letter} label="Copy" />
                <DownloadButton content={coverLetter.full_letter} filename={coverFilename} isCoverLetter />
              </div>
            }
          >
            Cover Letter ({coverLetter.word_count} words · {coverLetter.tone})
          </SectionLabel>
          <pre
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13.5px",
              lineHeight: "1.8",
              color: "var(--text-soft)",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "20px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {coverLetter.full_letter}
          </pre>
        </Card>
      )}

      {/* Actions */}
      {actionList && actionList.length > 0 && (
        <Card>
          <SectionLabel>Action Items ({actionList.length})</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {actionList.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--color-gold)",
                    background: "rgba(201, 169, 98, 0.10)",
                    borderRadius: "100px",
                    padding: "2px 8px",
                    flexShrink: 0,
                  }}
                >
                  P{a.priority}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "var(--text)", margin: 0 }}>{a.action}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-faint)", margin: "4px 0 0" }}>{a.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Raw JD */}
      {run.jd_text && (
        <Card>
          <SectionLabel actions={<CopyButton text={run.jd_text} label="Copy" />}>
            Job Description (raw)
          </SectionLabel>
          <RawText text={run.jd_text} />
        </Card>
      )}

      {/* Resume */}
      {run.resume_text && (
        <Card>
          <SectionLabel actions={<CopyButton text={run.resume_text} label="Copy" />}>
            Resume (raw)
          </SectionLabel>
          <RawText text={run.resume_text} />
        </Card>
      )}

      {/* Errors */}
      {run.error_message && (
        <Card>
          <SectionLabel>Errors</SectionLabel>
          <pre
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#ff6b6b",
              background: "rgba(220, 53, 69, 0.06)",
              border: "1px solid rgba(220, 53, 69, 0.15)",
              borderRadius: "var(--radius-md)",
              padding: "14px",
              whiteSpace: "pre-wrap",
              margin: 0,
            }}
          >
            {run.error_message}
          </pre>
        </Card>
      )}
    </div>
  );
}
