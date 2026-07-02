"use client";

export function GapAnalysisDisplay({
  gaps,
}: {
  gaps: { gaps: Array<{ status: string; requirement: string; similarity_score: number; category: string }> } | null;
}) {
  if (!gaps || !gaps.gaps || gaps.gaps.length === 0) return null;

  const getSeverity = (status: string) => {
    switch (status) {
      case "missing": return { label: "Critical", bg: "rgba(201, 169, 98, 0.15)", color: "var(--color-gold-light)", border: "rgba(201, 169, 98, 0.3)" };
      case "partial": return { label: "Moderate", bg: "rgba(201, 169, 98, 0.08)", color: "var(--color-gold)", border: "rgba(201, 169, 98, 0.15)" };
      default: return { label: "Minor", bg: "rgba(156, 163, 175, 0.08)", color: "var(--text-faint)", border: "rgba(156, 163, 175, 0.15)" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {gaps.gaps.map((gap, i) => {
        const severity = getSeverity(gap.status);
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr",
              gap: "20px",
              paddingBottom: "16px",
              borderBottom: i < gaps.gaps.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                borderRadius: "100px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: severity.bg,
                color: severity.color,
                border: `1px solid ${severity.border}`,
              }}
            >
              {severity.label}
            </span>
            <div>
              <p style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text)" }}>
                {gap.requirement}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                {Math.round(gap.similarity_score * 100)}% match &middot; {gap.category.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
