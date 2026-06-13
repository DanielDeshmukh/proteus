export function Card({ children, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "26px",
      }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>
}
