"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { JDInput } from "@/components/JDInput";
import { ResumeInput } from "@/components/ResumeInput";
import { Card } from "@/components/Card";
import { Spinner } from "@/components/Spinner";
import { Toast } from "@/components/Toast";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { GapAnalysisDisplay } from "@/components/GapAnalysisDisplay";
import { RewriteDisplay } from "@/components/RewriteDisplay";
import { CoverLetterDisplay } from "@/components/CoverLetterDisplay";
import { ActionList } from "@/components/ActionList";
import { apiPost, apiPostStream, apiGet } from "@/lib/api";
import type { GapAnalysis } from "@/types";

const pipelineStages = [
  { num: "01", name: "Parse", desc: "Extracts role, requirements, and seniority signal from the JD" },
  { num: "02", name: "Calibrate", desc: "Scores semantic match via embedding similarity" },
  { num: "03", name: "Map", desc: "Ranks gaps between resume and requirements" },
  { num: "04", name: "Rewrite", desc: "Drafts JD-aware rewrites for weak bullets" },
  { num: "05", name: "Draft", desc: "Writes a cover letter from the same context" },
];

export default function AnalyzePage() {
  const [jd, setJd] = useState<{ type: string; value: string | File } | null>(null);
  const [resume, setResume] = useState<{ type: string; value: string | File } | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<number | null>(null);
  const [stageLabel, setStageLabel] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const partialRef = useRef<{ gaps: unknown; rewrites: unknown; coverLetter: unknown }>({ gaps: null, rewrites: null, coverLetter: null });

  // Partial results — rendered incrementally as events arrive
  const [partialGaps, setPartialGaps] = useState<Record<string, unknown> | null>(null);
  const [partialRewrites, setPartialRewrites] = useState<Record<string, unknown> | null>(null);
  const [partialCoverLetter, setPartialCoverLetter] = useState<Record<string, unknown> | null>(null);

  // Final result — only set on "done"
  const [result, setResult] = useState<{
    run_id?: number | null;
    overall_score?: number | null;
    section_scores?: Record<string, number> | null;
    gap_analysis?: unknown;
    rewrite_suggestions?: unknown;
    cover_letter?: unknown;
    action_list?: unknown[] | null;
    timings?: Record<string, number> | null;
    errors?: string[] | null;
  } | null>(null);

  const canAnalyze = jd && resume;

  useEffect(() => {
    apiGet("/api/usage").then((data) => setUsage(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => {
    if (!loading) return;
    const start = Date.now();
    const timer = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);
    return () => clearInterval(timer);
  }, [loading]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setElapsed(0);
    setCurrentStage(null);
    setStageLabel("");
    setError(null);
    setResult(null);
    setPartialGaps(null);
    setPartialRewrites(null);
    setPartialCoverLetter(null);
    partialRef.current = { gaps: null, rewrites: null, coverLetter: null };

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 300_000);

    const useStreaming = jd.type === "text" && resume.type === "text";

    try {
      if (useStreaming) {
        const formData = new FormData();
        formData.append("jd_text", jd.value as string);
        formData.append("resume_text", resume.value as string);

        await apiPostStream("/api/analyze/stream", formData, (event) => {
          const evt = event as { event: string; data?: Record<string, unknown>; run_id?: number; message?: string };

          if (evt.event === "started") {
            setCurrentStage(0);
            setStageLabel("Parsing documents...");
          } else if (evt.event === "jd_parsed") {
            // JD parsed — no partial render needed, just internal state
          } else if (evt.event === "resume_parsed") {
            setStageLabel("Documents parsed — analyzing gaps...");
          } else if (evt.event === "analyzing") {
            setCurrentStage(1);
            setStageLabel("Computing semantic similarity...");
          } else if (evt.event === "gap_analysis") {
            setPartialGaps(evt.data ?? null);
            partialRef.current.gaps = evt.data ?? null;
            setCurrentStage(2);
            setStageLabel("Gaps mapped — generating rewrites...");
          } else if (evt.event === "generating") {
            setCurrentStage(3);
            setStageLabel("Generating rewrites and cover letter...");
          } else if (evt.event === "rewrites") {
            setPartialRewrites(evt.data ?? null);
            partialRef.current.rewrites = evt.data ?? null;
          } else if (evt.event === "cover_letter") {
            setPartialCoverLetter(evt.data ?? null);
            partialRef.current.coverLetter = evt.data ?? null;
          } else if (evt.event === "result") {
            setCurrentStage(4);
            setStageLabel("Aggregating scores...");
          } else if (evt.event === "done") {
            const p = partialRef.current;
            setResult({
              run_id: evt.run_id,
              overall_score: (p.gaps as GapAnalysis | null)?.overall_match ?? null,
              section_scores: null,
              gap_analysis: p.gaps,
              rewrite_suggestions: p.rewrites,
              cover_letter: p.coverLetter,
              action_list: null,
              timings: { total: elapsed },
              errors: null,
            });
          } else if (evt.event === "error") {
            throw new Error(evt.message);
          }
        }, controller.signal);
      } else {
        const formData = new FormData();
        if (jd.type === "text") formData.append("jd_text", jd.value as string);
        else if (jd.type === "url") formData.append("jd_url", jd.value as string);
        else if (jd.type === "file") formData.append("jd_file", jd.value as File);

        if (resume.type === "text") formData.append("resume_text", resume.value as string);
        else if (resume.type === "file") formData.append("resume_file", resume.value as File);

        const data = await apiPost("/api/analyze", formData);
        setResult(data);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Analysis cancelled");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
      setLoading(false);
    }
  };

  const hasPartialResults = loading && (partialGaps || partialRewrites || partialCoverLetter);

  return (
    <Layout>
      {/* Hero */}
      <section style={{ padding: "48px 0 32px" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            marginBottom: "14px",
          }}
        >
          Application intelligence
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(28px, 5vw, 48px)",
            lineHeight: 1.18,
            maxWidth: "760px",
            color: "var(--text)",
          }}
        >
          One pipeline. One JD.
          <br />
          Every output stays <em style={{ fontStyle: "italic", color: "var(--color-gold-light)" }}>consistent.</em>
        </h1>
        <p
          style={{
            marginTop: "18px",
            maxWidth: "620px",
            color: "var(--text-soft)",
            fontSize: "clamp(13px, 2vw, 15.5px)",
            lineHeight: 1.75,
          }}
        >
          Paste, upload, or link a job description and your resume. Proteus runs both through a
          five-agent pipeline and returns a semantic match score, a gap analysis, bullet-level
          rewrites, and a cover letter.
        </p>
      </section>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Input grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))",
          gap: "20px",
          marginTop: "36px",
        }}
      >
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 18px" }}>
            <JDInput onJDReady={setJd} />
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 18px" }}>
            <ResumeInput onResumeReady={setResume} />
          </div>
        </div>
      </section>

      {/* Analyze / Cancel button */}
      <div style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "440px", justifyContent: "center" }}>
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || loading}
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "14px",
              color: canAnalyze && !loading ? "#111315" : "var(--text-faint)",
              background: canAnalyze && !loading ? "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))" : "var(--surface-sunken)",
              border: canAnalyze && !loading ? "none" : "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "14px 32px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: canAnalyze && !loading ? "pointer" : "not-allowed",
              opacity: canAnalyze && !loading ? 1 : 0.5,
              transition: "transform .15s ease, filter .15s ease",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                Run Proteus pipeline
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
          {loading && (
            <button
              onClick={handleCancel}
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: "13px",
                color: "var(--text-soft)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "14px 20px",
                cursor: "pointer",
                transition: "background .15s ease",
                flexShrink: 0,
              }}
            >
              Cancel
            </button>
          )}
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--text-faint)" }}>
          {loading
            ? stageLabel || `Analyzing... ${elapsed.toFixed(1)}s`
            : result
              ? `Completed in ${(result.timings as Record<string, number>)?.total?.toFixed(1)}s`
              : "Ready to analyze"}
        </span>
        {usage && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: usage.used >= usage.limit ? "#ff6b6b" : "var(--text-faint)" }}>
            {usage.used}/{usage.limit} analyses today
          </span>
        )}
      </div>

      {/* Pipeline stages */}
      <section style={{ marginTop: "48px", padding: "28px 0 8px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "28px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)" }}>Pipeline</h3>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--text-faint)" }}>Five agents · shared JD context · NVIDIA NIM</span>
        </div>
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "8px",
            paddingBottom: "28px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={{ position: "absolute", top: "9px", left: "5%", right: "5%", height: "1px", background: "var(--color-gold)", opacity: 0.35 }} />
          {pipelineStages.map((stage, i) => {
            const isActive = loading && currentStage === i;
            const isDone = loading && currentStage !== null && currentStage > i;
            return (
              <div key={stage.num} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", minWidth: "80px" }}>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: isDone ? "var(--color-gold)" : "var(--surface)",
                    border: `2px solid ${isActive ? "var(--color-gold-light)" : "var(--color-gold)"}`,
                    position: "relative",
                    zIndex: 1,
                    transition: "all 0.4s ease",
                    boxShadow: isActive ? "0 0 12px rgba(201,169,98,0.4)" : "none",
                    flexShrink: 0,
                  }}
                >
                  {!isDone && <div style={{ position: "absolute", inset: "3px", borderRadius: "50%", background: "var(--color-gold)" }} />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-gold)", letterSpacing: "0.1em" }}>{stage.num}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>{stage.name}</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-soft)", lineHeight: 1.4, maxWidth: "140px" }}>{stage.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Partial results — appear as each stage completes */}
      {loading && hasPartialResults && (
        <section style={{ marginTop: "44px" }}>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "6px" }}>Live results</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(20px, 3vw, 26px)", color: "var(--text)" }}>Analyzing in progress</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {partialGaps && (
              <Card>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>Gap analysis</h3>
                <GapAnalysisDisplay gaps={partialGaps as never} />
              </Card>
            )}

            {partialRewrites && (
              <Card>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>Rewrite suggestions</h3>
                <RewriteDisplay rewrites={partialRewrites as never} />
              </Card>
            )}

            {partialCoverLetter && (
              <Card>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>Cover letter</h3>
                <CoverLetterDisplay coverLetter={partialCoverLetter as never} />
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Final result */}
      {result ? (
        <section ref={resultsRef} style={{ marginTop: "44px" }}>
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "6px" }}>Run result</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(20px, 3vw, 26px)", color: "var(--text)" }}>Analysis Complete</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {result.overall_score != null && (
              <Card>
                <ScoreDisplay score={result.overall_score as number} sectionScores={result.section_scores as Record<string, number>} />
              </Card>
            )}

            {result.gap_analysis != null && (
              <Card>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>Gap analysis</h3>
                <GapAnalysisDisplay gaps={result.gap_analysis as never} />
              </Card>
            )}

            {result.rewrite_suggestions != null && (
              <Card>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>Rewrite suggestions</h3>
                <RewriteDisplay rewrites={result.rewrite_suggestions as never} />
              </Card>
            )}

            {result.cover_letter != null && (
              <Card>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>Cover letter</h3>
                <CoverLetterDisplay coverLetter={result.cover_letter as never} />
              </Card>
            )}

            {result.action_list != null && Array.isArray(result.action_list) && result.action_list.length > 0 && (
              <Card>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>Priority actions</h3>
                <ActionList actions={result.action_list as never} />
              </Card>
            )}

            <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-faint)", paddingBottom: "16px", fontFamily: "var(--font-mono)" }}>
              Run ID: {result.run_id}
            </div>
          </div>
        </section>
      ) : null}
    </Layout>
  );
}
