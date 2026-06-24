export function Toast({ message, type = "info", onClose }) {
  const types = {
    info: {
      background: "rgba(201, 169, 98, 0.10)",
      color: "var(--color-gold)",
      border: "1px solid rgba(201, 169, 98, 0.25)",
    },
    success: {
      background: "rgba(232, 213, 163, 0.14)",
      color: "var(--color-gold-light)",
      border: "1px solid rgba(232, 213, 163, 0.3)",
    },
    error: {
      background: "rgba(220, 53, 69, 0.15)",
      color: "#ff6b6b",
      border: "1px solid rgba(220, 53, 69, 0.3)",
    },
    warning: {
      background: "rgba(125, 138, 150, 0.10)",
      color: "var(--color-silver)",
      border: "1px solid rgba(125, 138, 150, 0.22)",
    },
  };
  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-mono)",
    fontSize: "12.5px",
    letterSpacing: "0.02em",
    ...types[type],
  };
  return (
    <div style={style}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            marginLeft: "8px",
            opacity: 0.5,
            cursor: "pointer",
            background: "none",
            border: "none",
            color: "inherit",
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
