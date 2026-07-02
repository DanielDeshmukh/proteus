"use client";

export function Toast({
  message,
  type = "info",
  onClose,
}: {
  message: string;
  type?: "info" | "success" | "error" | "warning";
  onClose?: () => void;
}) {
  const colors = {
    info: { bg: "rgba(201, 169, 98, 0.15)", color: "var(--color-gold-light)", border: "rgba(201, 169, 98, 0.3)" },
    success: { bg: "rgba(201, 169, 98, 0.10)", color: "var(--color-gold)", border: "rgba(201, 169, 98, 0.2)" },
    error: { bg: "rgba(220, 53, 69, 0.15)", color: "#ff6b6b", border: "rgba(220, 53, 69, 0.3)" },
    warning: { bg: "rgba(156, 163, 175, 0.15)", color: "#9ca3af", border: "rgba(156, 163, 175, 0.3)" },
  };

  const c = colors[type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontFamily: "var(--font-mono)",
        fontSize: "12.5px",
        letterSpacing: "0.02em",
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            opacity: 0.5,
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            padding: "0 0 0 12px",
            fontSize: "14px",
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
