export default function HistoryLoading() {
  return (
    <div style={{ padding: "40px 0" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ width: "100px", height: "24px", background: "var(--surface-sunken)", borderRadius: "6px", marginBottom: "8px" }} />
        <div style={{ width: "200px", height: "12px", background: "var(--surface-sunken)", borderRadius: "6px" }} />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ width: "100%", height: "42px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 20px", height: "68px" }} />
        ))}
      </div>
    </div>
  );
}
