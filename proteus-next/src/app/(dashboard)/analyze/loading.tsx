export default function AnalyzeLoading() {
  return (
    <div style={{ padding: "48px 0" }}>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ width: "120px", height: "10px", background: "var(--surface-sunken)", borderRadius: "6px", marginBottom: "16px" }} />
        <div style={{ width: "min(400px, 100%)", height: "32px", background: "var(--surface-sunken)", borderRadius: "6px", marginBottom: "10px" }} />
        <div style={{ width: "min(320px, 100%)", height: "14px", background: "var(--surface-sunken)", borderRadius: "6px" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "20px" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "32px", minHeight: "180px" }} />
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "32px", minHeight: "180px" }} />
      </div>
    </div>
  );
}
