"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { CopyButton } from "@/components/CopyButton";
import { TailoredResumeDownload } from "@/components/TailoredResumeDownload";
import { applyRewrites, type RewriteCandidate } from "@/lib/resume-export";

interface Suggestion extends RewriteCandidate {
  target_requirement?: string;
  rationale?: string;
  impact_score?: number;
}

export function RewriteDisplay({
  rewrites,
  resumeText,
  candidateLabel,
}: {
  rewrites: {
    suggestions: Suggestion[];
    hidden_experience?: string[];
  } | null;
  resumeText?: string | null;
  candidateLabel?: string;
}) {
  const suggestions = useMemo(() => rewrites?.suggestions ?? [], [rewrites]);
  const [accepted, setAccepted] = useState<number[]>([]);
  const interactive = Boolean(resumeText);

  const matched = useMemo(() => {
    if (!resumeText) return null;
    return suggestions.map((s) => applyRewrites(resumeText, [s]).appliedCount > 0);
  }, [resumeText, suggestions]);

  if (!rewrites || suggestions.length === 0) return null;

  const toggle = (i: number) =>
    setAccepted((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const acceptedSuggestions = accepted.map((i) => suggestions[i]);
  const acceptedText = acceptedSuggestions.map((s) => `• ${s.suggested_rewrite}`).join("\n");
  const notInResume = matched ? accepted.filter((i) => !matched[i]).length : 0;
  const allSelected = accepted.length > 0 && accepted.length === suggestions.length;

  const buttonStyle = (active: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: active ? "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))" : "var(--surface-sunken)",
    border: active ? "none" : "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: active ? "#111315" : "var(--text-soft)",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: active ? 600 : 400,
    fontFamily: "var(--font-sans)",
    cursor: "pointer",
    transition: "all .15s ease",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {suggestions.map((s, i) => {
        const isAccepted = accepted.includes(i);
        const missing = matched ? !matched[i] : false;
        return (
          <div
            key={i}
            style={{
              background: "var(--surface-sunken)",
              border: `1px solid ${isAccepted ? "rgba(201, 169, 98, 0.45)" : "var(--border)"}`,
              borderRadius: "var(--radius-md)",
              padding: "18px 20px",
              transition: "border-color .15s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {typeof s.impact_score === "number" && (
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
                )}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-gold)",
                  }}
                >
                  Addresses: {s.target_requirement}
                </span>
              </div>
              {interactive && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CopyButton text={s.suggested_rewrite} label="Copy" />
                  <button onClick={() => toggle(i)} style={buttonStyle(isAccepted)}>
                    {isAccepted ? "Accepted" : "Accept"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "16px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>Original</span>
              <p style={{ fontSize: "13.5px", color: "var(--text-soft)", lineHeight: 1.6, textDecoration: "line-through", opacity: 0.75, margin: 0 }}>
                {s.original_bullet}
              </p>
              <span style={{ fontSize: "12px", color: "var(--color-gold)" }}>Rewrite</span>
              <p style={{ fontSize: "13.5px", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>{s.suggested_rewrite}</p>
            </div>

            {s.rationale && (
              <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "10px", fontStyle: "italic", marginBottom: 0 }}>
                {s.rationale}
              </p>
            )}

            {interactive && missing && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "#ff6b6b",
                  background: "rgba(220, 53, 69, 0.08)",
                  border: "1px solid rgba(220, 53, 69, 0.2)",
                  borderRadius: "100px",
                  padding: "3px 10px",
                  display: "inline-block",
                  marginTop: "12px",
                  marginBottom: 0,
                }}
              >
                Original bullet not found in resume — skipped on export
              </p>
            )}
          </div>
        );
      })}

      {rewrites.hidden_experience && rewrites.hidden_experience.length > 0 && (
        <div
          style={{
            background: "rgba(201, 169, 98, 0.08)",
            border: "1px solid rgba(201, 169, 98, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
          }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", color: "var(--color-gold)", marginBottom: "8px" }}>
            Hidden Experience Detected
          </p>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {rewrites.hidden_experience.map((exp, i) => (
              <li key={i} style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.6 }}>
                {exp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {interactive && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            paddingTop: "14px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--text-faint)" }}>
            {accepted.length} of {suggestions.length} accepted
            {notInResume > 0 ? ` · ${notInResume} not in resume` : ""}
          </span>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setAccepted(allSelected ? [] : suggestions.map((_, i) => i))}
              style={buttonStyle(false)}
            >
              {allSelected ? "Clear" : "Accept all"}
            </button>
            {accepted.length > 0 && <CopyButton text={acceptedText} label="Copy accepted" />}
            <TailoredResumeDownload
              resumeText={resumeText as string}
              accepted={acceptedSuggestions}
              candidateLabel={candidateLabel || "Candidate"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
