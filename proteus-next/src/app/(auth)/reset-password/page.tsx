"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PasswordInput, PasswordStrength } from "@/components/auth/PasswordInput";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reset failed");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/signin"), 3000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "22px", color: "var(--text)", marginBottom: "10px" }}>Password reset!</h1>
          <p style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "28px" }}>
            Your password has been updated. Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "22px", color: "var(--text)", marginBottom: "10px" }}>Invalid reset link</h1>
          <p style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "28px" }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <a href="/forgot-password" style={{ display: "inline-block", background: "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))", color: "#111315", fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-sans)", textDecoration: "none", padding: "12px 28px", borderRadius: "var(--radius-md)" }}>
            Request new link
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
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(24px, 4vw, 28px)", color: "var(--text)", marginBottom: "8px" }}>Set new password</h1>
          <p style={{ fontSize: "14px", color: "var(--text-soft)" }}>Choose a strong password for your account</p>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: "20px", fontSize: "12.5px", color: "#f87171", lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-soft)", marginBottom: "6px", fontFamily: "var(--font-sans)" }}>New password</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-soft)", marginBottom: "6px", fontFamily: "var(--font-sans)" }}>Confirm password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p style={{ fontSize: "11.5px", color: "#f87171", marginTop: "4px", fontFamily: "var(--font-sans)" }}>Passwords don&apos;t match</p>
            )}
          </div>

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
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--text-faint)" }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
