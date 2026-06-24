export function GapAnalysisDisplay({ gaps }) {
  if (!gaps || !gaps.gaps || gaps.gaps.length === 0) return null;

  const severityStyles = {
    missing: {
      background: "rgba(232, 213, 163, 0.14)",
      color: "var(--color-gold-light)",
      border: "1px solid rgba(232, 213, 163, 0.3)",
    },
    partial: {
      background: "rgba(201, 169, 98, 0.10)",
      color: "var(--color-gold)",
      border: "1px solid rgba(201, 169, 98, 0.25)",
    },
    matched: {
      background: "rgba(125, 138, 150, 0.10)",
      color: "var(--color-silver)",
      border: "1px solid rgba(125, 138, 150, 0.22)",
    },
  };

  const severityLabels = {
    missing: "Critical",
    partial: "Moderate",
    matched: "Minor",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {gaps.gaps.map((gap, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "110px 1fr",
            gap: "20px",
            padding: "16px 0",
            borderBottom: i < gaps.gaps.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "5px 10px",
              borderRadius: "100px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "24px",
              width: "fit-content",
              ...severityStyles[gap.status],
            }}
          >
            {severityLabels[gap.status] || gap.status}
          </span>
          <div>
            <h4
              style={{
                fontSize: "14.5px",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "6px",
              }}
            >
              {gap.requirement}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.65 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--color-gold)",
                }}
              >
                {Math.round(gap.similarity_score * 100)}%
              </span>{" "}
              match — {gap.category}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
