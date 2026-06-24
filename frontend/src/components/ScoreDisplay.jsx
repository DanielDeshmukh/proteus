export function ScoreDisplay({ score, sectionScores, label = "Overall Match" }) {
  const percentage = Math.round((score || 0) * 100);

  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="90"
            cy="90"
            r="70"
            fill="none"
            stroke="var(--surface-sunken)"
            strokeWidth="10"
          />
          <circle
            cx="90"
            cy="90"
            r="70"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "44px",
              fontWeight: 500,
              color: "var(--color-gold-light)",
              lineHeight: 1,
            }}
          >
            {percentage}
            <sup style={{ fontSize: "18px", marginLeft: "2px", color: "var(--color-gold)" }}>%</sup>
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-soft)",
            }}
          >
            Semantic match
          </span>
        </div>
      </div>

      <div>
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "17px",
              color: "var(--text)",
            }}
          >
            Score breakdown
          </h3>
          <p style={{ fontSize: "12.5px", color: "var(--text-faint)", marginTop: "4px" }}>
            Embedding similarity, weighted by section relevance
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {sectionScores &&
            Object.entries(sectionScores).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px 1fr 52px",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span style={{ fontSize: "13.5px", color: "var(--text)" }}>
                  {key.replace(/_/g, " ")}
                </span>
                <div
                  style={{
                    height: "6px",
                    borderRadius: "4px",
                    background: "var(--surface-sunken)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "4px",
                      background:
                        "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
                      width: `${Math.round(value * 100)}%`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    textAlign: "right",
                    color: "var(--color-gold-light)",
                  }}
                >
                  {Math.round(value * 100)}%
                </span>
              </div>
            ))}
          {!sectionScores && (
            <p style={{ fontSize: "13px", color: "var(--text-soft)" }}>
              No section scores available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
