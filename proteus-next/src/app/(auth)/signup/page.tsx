"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PasswordInput, PasswordStrength } from "@/components/auth/PasswordInput";
import { signupSchema } from "@/lib/auth/validation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const result = signupSchema.safeParse({ name, email, password });
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        router.push("/signin");
      } else {
        window.location.href = "/analyze";
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 20px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ display: "inline-block", width: "34px", height: "34px", border: "1.5px solid var(--color-gold)", borderRadius: "8px", transform: "rotate(45deg)", marginBottom: "18px", position: "relative" }}>
            <div style={{ position: "absolute", inset: "7px", border: "1.5px solid var(--color-gold-light)", borderRadius: "3px" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(24px, 4vw, 28px)", color: "var(--text)", marginBottom: "8px" }}>Create your account</h1>
          <p style={{ fontSize: "14px", color: "var(--text-soft)" }}>Start analyzing your resume with AI</p>
        </div>

        {serverError && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: "20px", fontSize: "12.5px", color: "#f87171", lineHeight: 1.6 }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "14px" }}>
            <label htmlFor="signup-name" style={{ display: "block", fontSize: "13px", color: "var(--text-soft)", marginBottom: "6px", fontFamily: "var(--font-sans)" }}>Full name</label>
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              style={{
                width: "100%",
                background: "var(--surface-sunken)",
                border: errors.name ? "1px solid #ef4444" : "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                padding: "12px 14px",
                outline: "none",
                transition: "border-color .15s ease",
                boxSizing: "border-box",
              }}
            />
            {errors.name && <p style={{ fontSize: "11.5px", color: "#f87171", marginTop: "4px", fontFamily: "var(--font-sans)" }}>{errors.name}</p>}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor="signup-email" style={{ display: "block", fontSize: "13px", color: "var(--text-soft)", marginBottom: "6px", fontFamily: "var(--font-sans)" }}>Email address</label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: "100%",
                background: "var(--surface-sunken)",
                border: errors.email ? "1px solid #ef4444" : "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                padding: "12px 14px",
                outline: "none",
                transition: "border-color .15s ease",
                boxSizing: "border-box",
              }}
            />
            {errors.email && <p style={{ fontSize: "11.5px", color: "#f87171", marginTop: "4px", fontFamily: "var(--font-sans)" }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="signup-password" style={{ display: "block", fontSize: "13px", color: "var(--text-soft)", marginBottom: "6px", fontFamily: "var(--font-sans)" }}>Password</label>
            <PasswordInput
              id="signup-password"
              value={password}
              onChange={setPassword}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
            {errors.password && <p style={{ fontSize: "11.5px", color: "#f87171", marginTop: "4px", fontFamily: "var(--font-sans)" }}>{errors.password}</p>}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => signIn("google", { callbackUrl: "/analyze" })}
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
            Sign up with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/analyze" })}
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
            Sign up with GitHub
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-soft)", marginTop: "24px", lineHeight: 1.6 }}>
          Already have an account?{" "}
          <a href="/signin" style={{ color: "var(--color-gold)", textDecoration: "none", fontWeight: 500 }}>Sign in</a>
        </p>

        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-faint)", marginTop: "16px", lineHeight: 1.6 }}>
          By creating an account, you agree to our{" "}
          <a href="/terms" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" style={{ color: "var(--color-gold)", textDecoration: "none" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
