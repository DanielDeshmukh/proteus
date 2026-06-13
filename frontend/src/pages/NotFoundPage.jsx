import { Link } from "react-router-dom"
import { Layout } from "../components/Layout"

export function NotFoundPage() {
  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          gap: "24px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "120px",
            fontWeight: 500,
            lineHeight: 1,
            color: "var(--color-gold)",
            opacity: 0.25,
          }}
        >
          404
        </span>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "28px",
            color: "var(--text)",
            marginTop: "-16px",
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "var(--text-soft)",
            maxWidth: "420px",
            lineHeight: 1.7,
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Head back to the dashboard to run an analysis.
        </p>

        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--surface-sunken)",
            background: "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "12px 28px",
            textDecoration: "none",
            transition: "filter .15s ease",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>
      </div>
    </Layout>
  )
}
