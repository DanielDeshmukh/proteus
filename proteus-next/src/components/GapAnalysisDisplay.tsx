"use client";

import { useState } from "react";

interface Gap {
  status: string;
  requirement: string;
  similarity_score: number;
  category: string;
}

export function GapAnalysisDisplay({
  gaps,
}: {
  gaps: { gaps: Gap[] } | null;
}) {
  if (!gaps || !gaps.gaps || gaps.gaps.length === 0) return null;

  const missing = gaps.gaps.filter((g) => g.status === "missing");
  const partial = gaps.gaps.filter((g) => g.status === "partial");

  const groups = [
    { key: "critical", label: "Critical", desc: "Missing from resume", items: missing, color: "var(--color-gold-light)", bg: "rgba(201,169,98,0.12)", border: "rgba(201,169,98,0.3)" },
    { key: "moderate", label: "Moderate", desc: "Partially matched", items: partial, color: "var(--color-gold)", bg: "rgba(201,169,98,0.06)", border: "rgba(201,169,98,0.15)" },
  ].filter((g) => g.items.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {groups.map((group) => (
        <GroupSection key={group.key} group={group} />
      ))}
    </div>
  );
}

function GroupSection({
  group,
}: {
  group: {
    key: string;
    label: string;
    desc: string;
    items: Gap[];
    color: string;
    bg: string;
    border: string;
  };
}) {
  const [expanded, setExpanded] = useState(group.key === "critical");

  return (
    <div
      style={{
        border: `1px solid ${group.border}`,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 14px",
          background: group.bg,
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.08em",
            color: group.color,
            background: "rgba(0,0,0,0.3)",
            borderRadius: "100px",
            padding: "3px 10px",
            flexShrink: 0,
          }}
        >
          {group.label}
        </span>
        <span style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>
          {group.items.length} {group.items.length === 1 ? "requirement" : "requirements"} — {group.desc}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: "var(--text-faint)",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          ▸
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {group.items.map((gap, i) => (
            <span
              key={i}
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-soft)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "4px 10px",
                lineHeight: 1.4,
              }}
              title={`${Math.round(gap.similarity_score * 100)}% match · ${gap.category.replace(/_/g, " ")}`}
            >
              {gap.requirement}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
