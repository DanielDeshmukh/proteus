"use client";

export default function ModelsError({
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
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 500, color: "var(--text)", marginBottom: "8px" }}>Failed to load models</h2>
      <p style={{ fontSize: "13px", color: "var(--text-soft)", marginBottom: "20px" }}>
        Could not load model configuration. NVIDIA NIM may be unreachable.
      </p>
      <button onClick={reset} style={{ fontSize: "13px", color: "var(--color-gold)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 24px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        Retry
      </button>
    </div>
  );
}
