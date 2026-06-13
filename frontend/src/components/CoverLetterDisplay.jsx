import { useState } from "react"

export function CoverLetterDisplay({ coverLetter }) {
  const [copied, setCopied] = useState(false)

  if (!coverLetter) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter.full_letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "9px 16px",
            fontSize: "12.5px",
            fontWeight: 500,
            color: "var(--text-soft)",
            cursor: "pointer",
            transition: "all .15s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div
        style={{
          background: "var(--surface-sunken)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "40px 44px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-faint)",
            marginBottom: "28px",
            lineHeight: 1.8,
          }}
        >
          Re: {coverLetter.job_title || "Position"}
        </div>
        <pre
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15.5px",
            lineHeight: 1.9,
            color: "var(--text)",
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {coverLetter.full_letter}
        </pre>
      </div>

      {coverLetter.key_points_addressed && coverLetter.key_points_addressed.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {coverLetter.key_points_addressed.map((point, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "5px 12px",
                borderRadius: "100px",
                display: "inline-block",
                background: "rgba(201, 169, 98, 0.10)",
                color: "var(--color-gold)",
                border: "1px solid rgba(201, 169, 98, 0.25)",
              }}
            >
              {point}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
