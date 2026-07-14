"use client";

export default function DocsError({
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
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 500, color: "var(--text)", marginBottom: "8px" }}>Failed to load documentation</h2>
      <p style={{ fontSize: "13px", color: "var(--text-soft)", marginBottom: "20px" }}>
        Could not load the user guide. Please try again.
      </p>
      <button onClick={reset} style={{ fontSize: "13px", color: "var(--color-gold)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 24px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        Retry
      </button>
    </div>
  );
}
