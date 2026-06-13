import { useState } from "react"
import { Layout } from "../components/Layout"
import { JDInput } from "../components/JDInput"
import { ResumeInput } from "../components/ResumeInput"
import { Card } from "../components/Card"
import { Spinner } from "../components/Spinner"
import { Toast } from "../components/Toast"
import { ScoreDisplay } from "../components/ScoreDisplay"
import { GapAnalysisDisplay } from "../components/GapAnalysisDisplay"
import { RewriteDisplay } from "../components/RewriteDisplay"
import { CoverLetterDisplay } from "../components/CoverLetterDisplay"
import { ActionList } from "../components/ActionList"

const pipelineStages = [
  { num: "01", name: "Parse", desc: "Extracts role, requirements, and seniority signal from the JD" },
  { num: "02", name: "Calibrate", desc: "Scores semantic match via embedding similarity" },
  { num: "03", name: "Map", desc: "Ranks gaps between resume and requirements" },
  { num: "04", name: "Rewrite", desc: "Drafts JD-aware rewrites for weak bullets" },
  { num: "05", name: "Draft", desc: "Writes a cover letter from the same context" },
]

export function AnalyzePage() {
  const [jd, setJd] = useState(null)
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const canAnalyze = jd && resume

  const handleAnalyze = async () => {
    if (!canAnalyze) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()

      if (jd.type === "text") {
        formData.append("jd_text", jd.value)
      } else if (jd.type === "url") {
        formData.append("jd_url", jd.value)
      } else if (jd.type === "file") {
        formData.append("jd_file", jd.value)
      }

      if (resume.type === "text") {
        formData.append("resume_text", resume.value)
      } else if (resume.type === "file") {
        formData.append("resume_file", resume.value)
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/* Hero */}
      <section style={{ padding: "64px 0 48px" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            marginBottom: "18px",
          }}
        >
          Application intelligence
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "48px",
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
            maxWidth: "760px",
            color: "var(--text)",
          }}
        >
          One pipeline. One JD.<br />
          Every output stays <em style={{ fontStyle: "italic", color: "var(--color-gold-light)" }}>consistent.</em>
        </h1>
        <p
          style={{
            marginTop: "22px",
            maxWidth: "620px",
            color: "var(--text-soft)",
            fontSize: "15.5px",
            lineHeight: 1.75,
          }}
        >
          Paste, upload, or link a job description and your resume. Proteus runs both through a five-agent
          pipeline and returns a semantic match score, a gap analysis, bullet-level rewrites, and a cover letter.
        </p>
      </section>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Workspace */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "48px" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "20px 24px 22px", flex: 1 }}>
            <JDInput onJDReady={setJd} />
          </div>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "20px 24px 22px", flex: 1 }}>
            <ResumeInput onResumeReady={setResume} />
          </div>
        </div>
      </section>

      {/* Run button */}
      <div style={{ marginTop: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", flexDirection: "column" }}>
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "14.5px",
            letterSpacing: "0.02em",
            color: "var(--surface-sunken)",
            background: canAnalyze && !loading ? "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))" : "var(--surface-raised)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "15px 36px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: canAnalyze && !loading ? "pointer" : "not-allowed",
            opacity: canAnalyze && !loading ? 1 : 0.5,
            transition: "transform .15s ease, filter .15s ease",
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
          {result ? `Completed in ${result.timings?.total?.toFixed(1)}s` : "Ready to analyze"}
        </span>
      </div>

      {/* Pipeline visual */}
      <section
        style={{
          marginTop: "56px",
          padding: "32px 0 8px",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "36px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text)" }}>Pipeline</h3>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--text-faint)" }}>
            Five agents · shared JD context · NVIDIA NIM
          </span>
        </div>
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            paddingBottom: "36px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "9px",
              left: "5%",
              right: "5%",
              height: "1px",
              background: "var(--color-gold)",
              opacity: 0.35,
            }}
          />
          {pipelineStages.map((stage) => (
            <div
              key={stage.num}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--surface)",
                  border: "2px solid var(--color-gold)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "3px",
                    borderRadius: "50%",
                    background: "var(--color-gold)",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-gold)", letterSpacing: "0.1em" }}>
                  {stage.num}
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 500, color: "var(--text)" }}>
                  {stage.name}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-soft)", maxWidth: "160px", lineHeight: 1.5 }}>
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      {result && (
        <section style={{ marginTop: "52px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--color-gold)",
                  marginBottom: "6px",
                }}
              >
                Run result
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "26px", color: "var(--text)" }}>
                Analysis Complete
              </h2>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--text-faint)" }}>
              Completed just now
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Card>
              <ScoreDisplay score={result.overall_score} sectionScores={result.section_scores} />
            </Card>

            {result.gap_analysis && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "17px", color: "var(--text)" }}>
                      Gap analysis
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "var(--text-faint)", marginTop: "4px" }}>
                      Ranked by impact on the match score
                    </p>
                  </div>
                </div>
                <GapAnalysisDisplay gaps={result.gap_analysis} />
              </Card>
            )}

            {result.rewrite_suggestions && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "17px", color: "var(--text)" }}>
                      Rewrite suggestions
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "var(--text-faint)", marginTop: "4px" }}>
                      Bullet-level, written against the gaps above
                    </p>
                  </div>
                </div>
                <RewriteDisplay rewrites={result.rewrite_suggestions} />
              </Card>
            )}

            {result.cover_letter && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "17px", color: "var(--text)" }}>
                      Cover letter
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "var(--text-faint)", marginTop: "4px" }}>
                      Written from the same parsed context as the analysis above
                    </p>
                  </div>
                </div>
                <CoverLetterDisplay coverLetter={result.cover_letter} />
              </Card>
            )}

            {result.action_list && result.action_list.length > 0 && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "17px", color: "var(--text)" }}>
                      Priority actions
                    </h3>
                    <p style={{ fontSize: "12.5px", color: "var(--text-faint)", marginTop: "4px" }}>
                      Ranked by expected impact on match score
                    </p>
                  </div>
                </div>
                <ActionList actions={result.action_list} />
              </Card>
            )}

            <div style={{ textAlign: "center", fontSize: "11.5px", color: "var(--text-faint)", paddingBottom: "16px", fontFamily: "var(--font-mono)" }}>
              Run ID: {result.run_id} | {result.timings?.total?.toFixed(1)}s
            </div>
          </div>
        </section>
      )}
    </Layout>
  )
}
