"use client";

export default function OfflinePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 019 8.5M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "24px", color: "var(--text)", marginBottom: "12px" }}>You&apos;re offline</h1>
        <p style={{ fontSize: "14px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "32px" }}>
          It looks like you&apos;ve lost your internet connection. Please check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: "inline-block",
            background: "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))",
            color: "#111315",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            textDecoration: "none",
            padding: "13px 32px",
            borderRadius: "var(--radius-md)",
            border: "none",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
