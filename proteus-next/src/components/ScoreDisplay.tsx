"use client";

export function ScoreDisplay({
  score,
  sectionScores,
}: {
  score: number;
  sectionScores: Record<string, number> | null;
}) {
  const percentage = Math.round(score * 100);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - score * circumference;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r="70"
            fill="none"
            stroke="var(--surface-sunken)"
            strokeWidth="12"
          />
          <circle
            cx="90"
            cy="90"
            r="70"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div style={{ position: "relative", top: "-120px", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "44px",
              color: "var(--color-gold-light)",
              fontWeight: 400,
            }}
          >
            {percentage}%
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
            Semantic match
          </p>
        </div>
      </div>

      <div>
        <h4
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "15px",
            color: "var(--text)",
            marginBottom: "16px",
          }}
        >
          Score breakdown
        </h4>
        {sectionScores ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {Object.entries(sectionScores).map(([key, value]) => (
              <div key={key} style={{ display: "grid", gridTemplateColumns: "150px 1fr 52px", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--text-soft)" }}>
                  {key.replace(/_/g, " ")}
                </span>
                <div style={{ height: "6px", background: "var(--surface-sunken)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round(value * 100)}%`,
                      background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
                      borderRadius: "4px",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-gold)", textAlign: "right" }}>
                  {Math.round(value * 100)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--text-faint)" }}>No section scores available</p>
        )}
      </div>
    </div>
  );
}
