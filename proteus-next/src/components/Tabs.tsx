"use client";

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "3px",
        border: "1px solid var(--border)",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "12.5px",
            fontWeight: 500,
            color:
              activeTab === tab.id
                ? "var(--surface-sunken)"
                : "var(--text-soft)",
            background:
              activeTab === tab.id ? "var(--color-gold)" : "none",
            border: "none",
            padding: "6px 13px",
            borderRadius: "7px",
            cursor: "pointer",
            transition: "all .15s ease",
          }}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
