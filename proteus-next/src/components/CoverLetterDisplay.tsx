"use client";

import { useState } from "react";

export function CoverLetterDisplay({
  coverLetter,
}: {
  coverLetter: {
    full_letter: string;
    job_title?: string;
    key_points_addressed?: string[];
  } | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!coverLetter) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter.full_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button
          onClick={handleCopy}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12.5px",
            fontWeight: 500,
            color: "var(--text-soft)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "6px 13px",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div
        style={{
          background: "var(--surface-sunken)",
          borderRadius: "var(--radius-md)",
          padding: "40px 44px",
        }}
      >
        {coverLetter.job_title && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginBottom: "16px",
            }}
          >
            Re: {coverLetter.job_title}
          </p>
        )}
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
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "16px" }}>
          {coverLetter.key_points_addressed.map((point, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                borderRadius: "100px",
                padding: "4px 12px",
                background: "rgba(201, 169, 98, 0.10)",
                color: "var(--color-gold)",
              }}
            >
              {point}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
