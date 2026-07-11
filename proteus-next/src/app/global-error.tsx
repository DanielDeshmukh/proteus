"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#111315", color: "#f5f5f0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "10px" }}>Something went wrong</h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: 1.7, marginBottom: "28px" }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            {error.digest && (
              <p style={{ fontSize: "11px", color: "#6b7280", fontFamily: "monospace", marginBottom: "24px" }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: "linear-gradient(180deg, #dfc08a, #c9a962)",
                color: "#111315",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "inherit",
                border: "none",
                padding: "13px 32px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
