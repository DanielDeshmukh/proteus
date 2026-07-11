export default function HistoryLoading() {
  return (
    <div style={{ padding: "48px 0" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ width: "100px", height: "28px", background: "var(--surface-sunken)", borderRadius: "6px", marginBottom: "10px" }} />
        <div style={{ width: "200px", height: "14px", background: "var(--surface-sunken)", borderRadius: "6px" }} />
      </div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ width: "100%", height: "44px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", height: "72px" }} />
        ))}
      </div>
    </div>
  );
}
