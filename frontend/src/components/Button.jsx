export function Button({ children, variant = "primary", disabled = false, onClick, className = "" }) {
  const base = "font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
  const variants = {
    primary: {
      background: "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))",
      color: "var(--surface-sunken)",
      border: "none",
      borderRadius: "var(--radius-md)",
      padding: "15px 36px",
      fontSize: "14.5px",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    secondary: {
      background: "var(--surface-sunken)",
      color: "var(--text-soft)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "9px 16px",
      fontSize: "12.5px",
      fontWeight: 500,
    },
    danger: {
      background: "rgba(220, 53, 69, 0.15)",
      color: "#ff6b6b",
      border: "1px solid rgba(220, 53, 69, 0.3)",
      borderRadius: "var(--radius-md)",
      padding: "9px 16px",
      fontSize: "12.5px",
      fontWeight: 500,
    },
    ghost: {
      background: "transparent",
      color: "var(--text-soft)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "9px 16px",
      fontSize: "12.5px",
      fontWeight: 500,
    },
  }

  const style = { ...variants[variant] }

  return (
    <button
      className={`${base} ${className}`}
      style={style}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
