export function ActionList({ actions }) {
  if (!actions || actions.length === 0) return null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {actions.map((action, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "110px 1fr",
            gap: "20px",
            padding: "16px 0",
            borderBottom: i < actions.length - 1 ? "1px solid var(--border)" : "none",
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
              background: "rgba(201, 169, 98, 0.10)",
              color: "var(--color-gold)",
              border: "1px solid rgba(201, 169, 98, 0.25)",
            }}
          >
            #{action.priority}
          </span>
          <div>
            <h4 style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
              {action.action}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-soft)", lineHeight: 1.65 }}>
              {action.impact}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
