export default function DocsLoading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ width: "240px", padding: "24px 16px", borderRight: "1px solid var(--border)" }}>
        <div style={{ height: "14px", width: "80px", background: "var(--surface-raised)", borderRadius: "4px", marginBottom: "16px" }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ height: "10px", width: `${100 - i * 12}px`, background: "var(--surface-raised)", borderRadius: "3px", marginBottom: "12px", opacity: 1 - i * 0.12 }} />
        ))}
      </div>
      <div style={{ flex: 1, padding: "32px 40px" }}>
        <div style={{ height: "28px", width: "200px", background: "var(--surface-raised)", borderRadius: "4px", marginBottom: "20px" }} />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ height: "12px", width: `${100 - (i % 3) * 20}%`, background: "var(--surface-raised)", borderRadius: "3px", marginBottom: "10px", opacity: 1 - (i % 3) * 0.15 }} />
        ))}
      </div>
    </div>
  );
}
