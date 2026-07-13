"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 7L2 7" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "22px", color: "var(--text)", marginBottom: "10px" }}>Check your email</h1>
          <p style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "28px" }}>
            If an account exists for <strong style={{ color: "var(--text)" }}>{email}</strong>, we&apos;ve sent a password reset link. The link expires in 1 hour.
          </p>
          <a href="/signin" style={{ fontSize: "13px", color: "var(--color-gold)", textDecoration: "none", fontFamily: "var(--font-sans)" }}>
            &larr; Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ display: "inline-block", width: "34px", height: "34px", border: "1.5px solid var(--color-gold)", borderRadius: "8px", transform: "rotate(45deg)", marginBottom: "18px", position: "relative" }}>
            <div style={{ position: "absolute", inset: "7px", border: "1.5px solid var(--color-gold-light)", borderRadius: "3px" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(24px, 4vw, 28px)", color: "var(--text)", marginBottom: "8px" }}>Forgot password?</h1>
          <p style={{ fontSize: "14px", color: "var(--text-soft)" }}>Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: "20px", fontSize: "12.5px", color: "#f87171", lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="forgot-email" style={{ display: "block", fontSize: "13px", color: "var(--text-soft)", marginBottom: "6px", fontFamily: "var(--font-sans)" }}>Email address</label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            style={{
              width: "100%",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text)",
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
              padding: "12px 14px",
              marginBottom: "14px",
              outline: "none",
              transition: "border-color .15s ease",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "14px",
              color: "#111315",
              background: loading ? "var(--surface-sunken)" : "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))",
              border: loading ? "1px solid var(--border)" : "none",
              borderRadius: "var(--radius-md)",
              padding: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all .15s ease",
            }}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-soft)", marginTop: "24px", lineHeight: 1.6 }}>
          Remember your password?{" "}
          <a href="/signin" style={{ color: "var(--color-gold)", textDecoration: "none", fontWeight: 500 }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
