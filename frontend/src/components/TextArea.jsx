export function TextArea({ label, placeholder, value, onChange, rows = 8, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && (
        <label style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text-soft)" }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          width: "100%",
          resize: "none",
          background: "var(--surface-sunken)",
          border: `1px solid ${error ? "#dc3545" : "var(--border)"}`,
          borderRadius: "var(--radius-md)",
          color: "var(--text)",
          fontFamily: "var(--font-sans)",
          fontSize: "13.5px",
          lineHeight: 1.7,
          padding: "16px",
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
      {error && <p style={{ fontSize: "13px", color: "#ff6b6b" }}>{error}</p>}
    </div>
  );
}
