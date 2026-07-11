export default function AnalyzeLoading() {
  return (
    <div style={{ padding: "64px 0" }}>
      <div style={{ marginBottom: "48px" }}>
        <div style={{ width: "120px", height: "12px", background: "var(--surface-sunken)", borderRadius: "6px", marginBottom: "18px" }} />
        <div style={{ width: "400px", height: "36px", background: "var(--surface-sunken)", borderRadius: "6px", marginBottom: "12px" }} />
        <div style={{ width: "320px", height: "16px", background: "var(--surface-sunken)", borderRadius: "6px" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "40px", minHeight: "200px" }} />
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "40px", minHeight: "200px" }} />
      </div>
    </div>
  );
}
