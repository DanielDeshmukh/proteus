import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "72px", fontWeight: 700, color: "rgba(201,169,98,0.15)", lineHeight: 1, marginBottom: "8px" }}>404</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "24px", color: "var(--text)", marginBottom: "12px" }}>Page not found</h1>
        <p style={{ fontSize: "14px", color: "var(--text-soft)", lineHeight: 1.7, marginBottom: "32px" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
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
