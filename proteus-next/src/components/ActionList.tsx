"use client";

export function ActionList({
  actions,
}: {
  actions: Array<{ priority: number; action: string; impact: string }> | null;
}) {
  if (!actions || actions.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {actions.map((action, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "110px 1fr",
            gap: "20px",
            paddingBottom: "16px",
            borderBottom: i < actions.length - 1 ? "1px solid var(--border)" : "none",
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
              background: "rgba(201, 169, 98, 0.10)",
              color: "var(--color-gold)",
              border: "1px solid rgba(201, 169, 98, 0.2)",
            }}
          >
            #{action.priority}
          </span>
          <div>
            <p style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--text)" }}>
              {action.action}
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-soft)", marginTop: "2px" }}>
              {action.impact}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
