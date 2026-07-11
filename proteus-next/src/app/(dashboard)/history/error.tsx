"use client";

export default function HistoryError({
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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 500, color: "var(--text)", marginBottom: "8px" }}>Failed to load history</h2>
      <p style={{ fontSize: "13px", color: "var(--text-soft)", marginBottom: "20px" }}>
        {error.message?.includes("database") || error.message?.includes("SQLITE")
          ? "Database connection issue. The service may be starting up."
          : "Could not load your analysis history."}
      </p>
      <button onClick={reset} style={{ fontSize: "13px", color: "var(--color-gold)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 24px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        Retry
      </button>
    </div>
  );
}
