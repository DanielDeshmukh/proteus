"use client";

export function RewriteDisplay({
  rewrites,
}: {
  rewrites: {
    suggestions: Array<{
      target_requirement: string;
      original_bullet: string;
      suggested_rewrite: string;
      rationale: string;
    }>;
    hidden_experience?: string[];
  } | null;
}) {
  if (!rewrites || !rewrites.suggestions || rewrites.suggestions.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {rewrites.suggestions.map((s, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "18px 20px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginBottom: "10px",
            }}
          >
            Addresses: {s.target_requirement}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "16px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>Original</span>
            <p style={{ fontSize: "13.5px", color: "var(--text-soft)", lineHeight: 1.6 }}>
              {s.original_bullet}
            </p>
            <span style={{ fontSize: "12px", color: "var(--color-gold)" }}>Rewrite</span>
            <p style={{ fontSize: "13.5px", color: "var(--text)", lineHeight: 1.6 }}>
              {s.suggested_rewrite}
            </p>
          </div>
          {s.rationale && (
            <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "10px", fontStyle: "italic" }}>
              {s.rationale}
            </p>
          )}
        </div>
      ))}

      {rewrites.hidden_experience && rewrites.hidden_experience.length > 0 && (
        <div
          style={{
            background: "rgba(201, 169, 98, 0.08)",
            border: "1px solid rgba(201, 169, 98, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
          }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", color: "var(--color-gold)", marginBottom: "8px" }}>
            Hidden Experience Detected
          </p>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {rewrites.hidden_experience.map((exp, i) => (
              <li key={i} style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.6 }}>
                {exp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
