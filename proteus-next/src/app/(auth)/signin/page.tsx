"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PasswordInput } from "@/components/auth/PasswordInput";

function SignInForm() {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/analyze";
  const urlError = searchParams.get("error");

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await signIn("email", { email, redirect: false, callbackUrl });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "10px" }}>Check your email</h2>
        <p style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.7, maxWidth: "320px", margin: "0 auto" }}>
          We sent a sign-in link to <strong style={{ color: "var(--text)" }}>{email}</strong>. It expires in 15 minutes.
        </p>
        <button onClick={() => { setSent(false); setEmail(""); setPassword(""); }} style={{ marginTop: "20px", fontSize: "13px", color: "var(--color-gold)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          Use a different email
        </button>
      </div>
    );
  }

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Error starting sign-in. Please try again.",
    OAuthCallback: "Error during sign-in. Please try again.",
    OAuthCreateAccount: "Could not create account. Please try again.",
    EmailCreateAccount: "Could not create account. Please try again.",
    Callback: "Sign-in callback error. Please try again.",
    OAuthAccountNotLinked: "This email is already associated with another sign-in method. Try Google or GitHub instead.",
    SessionRequired: "Please sign in to continue.",
    Verification: "The sign-in link has expired or was already used. Please request a new one.",
    CredentialsSignin: "Invalid email or password",
  };

  const displayError = error || (urlError ? (errorMessages[urlError] || "An error occurred. Please try again.") : "");

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div style={{ display: "inline-block", width: "34px", height: "34px", border: "1.5px solid var(--color-gold)", borderRadius: "8px", transform: "rotate(45deg)", marginBottom: "18px", position: "relative" }}>
          <div style={{ position: "absolute", inset: "7px", border: "1.5px solid var(--color-gold-light)", borderRadius: "3px" }} />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(24px, 4vw, 28px)", color: "var(--text)", marginBottom: "8px" }}>Welcome to PROTEUS</h1>
        <p style={{ fontSize: "14px", color: "var(--text-soft)" }}>Sign in to access your resume analytics</p>
      </div>

      {displayError && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: "20px", fontSize: "12.5px", color: "#f87171", lineHeight: 1.6 }}>
          {displayError}
        </div>
      )}

      {mode === "password" ? (
        <form onSubmit={handlePasswordSignIn}>
          <label htmlFor="signin-email" style={{ display: "block", fontSize: "13px", color: "var(--text-soft)", marginBottom: "6px", fontFamily: "var(--font-sans)" }}>Email address</label>
          <input
            id="signin-email"
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label htmlFor="signin-password" style={{ fontSize: "13px", color: "var(--text-soft)", fontFamily: "var(--font-sans)" }}>Password</label>
            <a href="/forgot-password" style={{ fontSize: "12px", color: "var(--color-gold)", textDecoration: "none", fontFamily: "var(--font-sans)" }}>
              Forgot password?
            </a>
          </div>
          <PasswordInput
            id="signin-password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "16px",
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleMagicLink}>
          <label htmlFor="magic-email" style={{ display: "block", fontSize: "13px", color: "var(--text-soft)", marginBottom: "6px", fontFamily: "var(--font-sans)" }}>Email address</label>
          <input
            id="magic-email"
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
            {loading ? "Sending link..." : "Send magic link"}
          </button>
        </form>
      )}

      <div style={{ margin: "20px 0 0", textAlign: "center" }}>
        <button
          onClick={() => { setMode(mode === "password" ? "magic" : "password"); setError(""); }}
          style={{ fontSize: "13px", color: "var(--color-gold)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}
        >
          {mode === "password" ? "Sign in with magic link instead" : "Sign in with password instead"}
        </button>
      </div>

      <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>OR</span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={() => signIn("google", { callbackUrl })}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            padding: "12px 14px",
            cursor: "pointer",
            transition: "border-color .15s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        <button
          onClick={() => signIn("github", { callbackUrl })}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            padding: "12px 14px",
            cursor: "pointer",
            transition: "border-color .15s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          Continue with GitHub
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-soft)", marginTop: "24px", lineHeight: 1.6 }}>
        Don&apos;t have an account?{" "}
        <a href="/signup" style={{ color: "var(--color-gold)", textDecoration: "none", fontWeight: 500 }}>Sign up</a>
      </p>

      <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-faint)", marginTop: "16px", lineHeight: 1.6 }}>
        By continuing, you agree to our{" "}
        <a href="/terms" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Terms of Service</a>
        {" "}and{" "}
        <a href="/privacy" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Privacy Policy</a>.
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <Suspense fallback={<div style={{ color: "var(--text-faint)" }}>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
