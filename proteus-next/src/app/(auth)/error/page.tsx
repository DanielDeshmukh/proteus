"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "unknown";

  const errorMessages: Record<string, { title: string; desc: string }> = {
    Configuration: { title: "Server configuration error", desc: "The auth provider is not properly configured. Please contact support." },
    AccessDenied: { title: "Access denied", desc: "You do not have permission to sign in." },
    Verification: { title: "Link expired", desc: "This sign-in link has expired or has already been used. Request a new one." },
    Default: { title: "Authentication error", desc: "An unexpected error occurred during sign-in." },
  };

  const { title, desc } = errorMessages[error] || errorMessages.Default;

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "22px", color: "var(--text)", marginBottom: "10px" }}>{title}</h1>
      <p style={{ fontSize: "14px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "28px" }}>{desc}</p>
      <a
        href="/signin"
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
        Try again
      </a>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <Suspense fallback={<div style={{ color: "var(--text-faint)" }}>Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
