export default function VerifyRequestPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "22px", color: "var(--text)", marginBottom: "10px" }}>Check your email</h1>
        <p style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "28px" }}>
          A sign-in link has been sent to your email address. Click the link to sign in to PROTEUS.
        </p>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px 20px", marginBottom: "20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-soft)", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "var(--text)" }}>Tip:</strong> Check your spam folder if you don&apos;t see the email. The link expires in 15 minutes.
          </p>
        </div>
        <a href="/signin" style={{ fontSize: "13px", color: "var(--color-gold)", textDecoration: "none", fontFamily: "var(--font-sans)" }}>
          &larr; Back to sign in
        </a>
      </div>
    </div>
  );
}
