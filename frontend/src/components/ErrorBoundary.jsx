import { Component } from "react";
import { Link } from "react-router-dom";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px",
            gap: "24px",
          }}
        >
          <span
            style={{
              width: "28px",
              height: "28px",
              border: "1.5px solid var(--color-gold)",
              borderRadius: "7px",
              position: "relative",
              transform: "rotate(45deg)",
              display: "inline-block",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: "6px",
                border: "1.5px solid var(--color-gold-light)",
                borderRadius: "3px",
              }}
            />
          </span>

          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "80px",
              fontWeight: 500,
              lineHeight: 1,
              color: "var(--color-gold)",
              opacity: 0.25,
            }}
          >
            500
          </span>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "28px",
              color: "var(--text)",
              marginTop: "-8px",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "var(--text-soft)",
              maxWidth: "420px",
              lineHeight: 1.7,
            }}
          >
            An unexpected error occurred while rendering this page. Try refreshing or head back to
            the dashboard.
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
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
      );
    }

    return this.props.children;
  }
}
