import { Link, useRouteError } from "react-router-dom"
import { Layout } from "../components/Layout"

export function ErrorPage() {
  const error = useRouteError()
  const status = error?.status || 500
  const message = error?.statusText || error?.message || "An unexpected error occurred"

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
          {status}
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
          {status === 500 ? "Something went wrong" : "Error"}
        </h1>

        <p
          style={{
            fontSize: "15px",
            color: "var(--text-soft)",
            maxWidth: "420px",
            lineHeight: 1.7,
          }}
        >
          {status === 500
            ? "The server encountered an error while processing your request. Please try again."
            : message}
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
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
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>

          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "14px",
              color: "var(--text-soft)",
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 28px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    </Layout>
  )
}
