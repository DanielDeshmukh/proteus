"use client";

export default function AnalyzeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "48px 0", textAlign: "center" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 500, color: "var(--text)", marginBottom: "8px" }}>Pipeline error</h2>
      <p style={{ fontSize: "13px", color: "var(--text-soft)", marginBottom: "20px" }}>
        {error.message?.includes("timeout") || error.message?.includes("TIMEOUT")
          ? "The AI models are taking too long to respond. This can happen during peak hours."
          : error.message?.includes("502") || error.message?.includes("503")
            ? "The AI service is temporarily unavailable. Please try again in a moment."
            : "An error occurred while running the analysis pipeline."}
      </p>
      <button onClick={reset} style={{ fontSize: "13px", color: "var(--color-gold)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 24px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        Retry
      </button>
    </div>
  );
}
