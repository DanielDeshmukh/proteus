"use client";

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "48px", fontWeight: 700, color: "rgba(201,169,98,0.15)", lineHeight: 1, marginBottom: "8px" }}>403</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "24px", color: "var(--text)", marginBottom: "12px" }}>Access denied</h1>
        <p style={{ fontSize: "14px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "32px" }}>
          You don&apos;t have permission to view this resource. If you believe this is a mistake, contact support.
        </p>
        <Link
          href="/"
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
          }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
