"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "getting-started", label: "Getting Started" },
  { id: "user-guide", label: "User Guide" },
  { id: "pipeline", label: "Pipeline Architecture" },
  { id: "models", label: "NVIDIA NIM Models" },
  { id: "rate-limits", label: "Rate Limits & Usage" },
  { id: "faq", label: "FAQ" },
  { id: "changelog", label: "Changelog" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          });
        },
        { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          padding: "32px 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
        className="docs-sidebar"
      >
        <div style={{ padding: "0 20px", marginBottom: "28px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <span
              style={{
                width: "22px",
                height: "22px",
                border: "1.5px solid var(--color-gold)",
                borderRadius: "5px",
                transform: "rotate(45deg)",
                display: "inline-block",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <span style={{ position: "absolute", inset: "5px", border: "1.5px solid var(--color-gold-light)", borderRadius: "2px" }} />
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text)" }}>
              Proteus
            </span>
          </Link>
          <p style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>Documentation</p>
        </div>

        <nav style={{ flex: 1, padding: "0 12px" }}>
          {sections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: isActive ? "var(--color-gold-light)" : "var(--text-soft)",
                  textDecoration: "none",
                  borderRadius: "var(--radius-md)",
                  background: isActive ? "rgba(201,169,98,0.08)" : "transparent",
                  border: "none",
                  marginBottom: "2px",
                  transition: "all .2s ease",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(201,169,98,0.04)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "2px",
                      height: "16px",
                      background: "var(--color-gold)",
                      borderRadius: "2px",
                    }}
                  />
                )}
                {section.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <Link
            href="/analyze"
            style={{
              display: "block",
              textAlign: "center",
              padding: "10px",
              background: "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))",
              color: "#111315",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
            }}
          >
            Open PROTEUS
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
