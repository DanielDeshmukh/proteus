"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "24px", color: "var(--text)", marginBottom: "12px" }}>Something went wrong</h1>
        <p style={{ fontSize: "14px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "12px" }}>
          An unexpected error occurred. If this keeps happening, please contact support.
        </p>
        {error.digest && (
          <p style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: "24px" }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              background: "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))",
              color: "#111315",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              border: "none",
              padding: "13px 32px",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-soft)",
              fontSize: "14px",
              fontWeight: 500,
              fontFamily: "var(--font-sans)",
              textDecoration: "none",
              padding: "13px 32px",
              borderRadius: "var(--radius-md)",
              display: "inline-block",
            }}
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
