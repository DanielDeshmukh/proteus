"use client";

import { useState, useRef, useEffect } from "react";
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
import { apiPost, apiPostStream } from "@/lib/api";

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
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
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
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => {
    if (!loading) { setElapsed(0); setCurrentStage(null); return; }
    const start = Date.now();
    const timer = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);
    return () => clearInterval(timer);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const useStreaming = jd.type === "text" && resume.type === "text";

    try {
      if (useStreaming) {
        const formData = new FormData();
        formData.append("jd_text", jd.value as string);
        formData.append("resume_text", resume.value as string);

        const partial: Record<string, unknown> = { run_id: null, timings: {} } as Record<string, unknown>;
        await apiPostStream("/api/analyze/stream", formData, (event) => {
          const evt = event as { event: string; data?: Record<string, unknown>; run_id?: number; message?: string };
          if (evt.event === "started") {
            partial.run_id = evt.run_id;
            setCurrentStage(0);
          } else if (evt.event === "gap_analysis") {
            partial.gap_analysis = evt.data;
            setCurrentStage(2);
          } else if (evt.event === "rewrites") {
            partial.rewrite_suggestions = evt.data;
            setCurrentStage(3);
          } else if (evt.event === "cover_letter") {
            partial.cover_letter = evt.data;
            setCurrentStage(4);
          } else if (evt.event === "result") {
            partial.overall_score = (evt.data as Record<string, unknown>)?.overall_score;
            partial.section_scores = (evt.data as Record<string, unknown>)?.section_scores;
            partial.action_list = (evt.data as Record<string, unknown>)?.action_list;
            setCurrentStage(4);
          } else if (evt.event === "done") {
            partial.run_id = evt.run_id;
            partial.timings = { total: 0 };
            setResult({ ...partial });
          } else if (evt.event === "error") {
            throw new Error(evt.message);
          }
        });
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
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Input grid - stacks on mobile */}
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

      {/* Analyze button */}
      <div style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexDirection: "column" }}>
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
            width: "100%",
            maxWidth: "360px",
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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--text-faint)" }}>
          {loading
            ? `Analyzing... ${elapsed.toFixed(1)}s`
            : result
              ? `Completed in ${(result.timings as Record<string, number>)?.total?.toFixed(1)}s`
              : "Ready to analyze"}
        </span>
      </div>

      {/* Pipeline stages */}
      <section style={{ marginTop: "48px", padding: "28px 0 8px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "28px", flexWrap: "wrap", gap: "8px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)" }}>Pipeline</h3>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--text-faint)" }}>Five agents · shared JD context · NVIDIA NIM</span>
        </div>
        {/* Horizontal scroll on mobile */}
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

      {/* Results */}
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
