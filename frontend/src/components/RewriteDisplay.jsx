export function RewriteDisplay({ rewrites }) {
  if (!rewrites || !rewrites.suggestions || rewrites.suggestions.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {rewrites.suggestions.map((suggestion, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "18px 20px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginBottom: "12px",
              display: "block",
            }}
          >
            Addresses · {suggestion.target_requirement}
          </span>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr",
              gap: "16px",
              alignItems: "start",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-faint)",
                paddingTop: "3px",
              }}
            >
              Original
            </span>
            <span style={{ fontSize: "13.5px", lineHeight: 1.7, color: "var(--text-soft)" }}>
              {suggestion.original_bullet}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr",
              gap: "16px",
              alignItems: "start",
              marginTop: "10px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-gold-light)",
                paddingTop: "3px",
              }}
            >
              Rewrite
            </span>
            <span style={{ fontSize: "13.5px", lineHeight: 1.7, color: "var(--text)" }}>
              {suggestion.suggested_rewrite}
            </span>
          </div>

          {suggestion.rationale && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-faint)",
                marginTop: "12px",
                lineHeight: 1.6,
              }}
            >
              {suggestion.rationale}
            </p>
          )}
        </div>
      ))}

      {rewrites.hidden_experience && rewrites.hidden_experience.length > 0 && (
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(201, 169, 98, 0.08)",
            border: "1px solid rgba(201, 169, 98, 0.2)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-gold-light)",
              marginBottom: "6px",
            }}
          >
            Hidden Experience Detected
          </p>
          <ul
            style={{ fontSize: "13px", color: "var(--color-gold)", margin: 0, paddingLeft: "16px" }}
          >
            {rewrites.hidden_experience.map((exp, i) => (
              <li key={i} style={{ marginBottom: "2px" }}>
                {exp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
