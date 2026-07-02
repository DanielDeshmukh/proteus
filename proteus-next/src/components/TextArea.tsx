"use client";

export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  rows = 8,
  error,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && (
        <label
          style={{
            fontSize: "13.5px",
            fontWeight: 500,
            color: "var(--text-soft)",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          width: "100%",
          background: "var(--surface-sunken)",
          border: `1px solid ${error ? "#dc3545" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: "13.5px",
          lineHeight: 1.7,
          padding: "16px",
          resize: "none",
        }}
      />
      {error && (
        <p style={{ fontSize: "13px", color: "#ff6b6b" }}>{error}</p>
      )}
    </div>
  );
}
