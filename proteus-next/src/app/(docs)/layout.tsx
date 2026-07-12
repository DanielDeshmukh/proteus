"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

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
            const isActive = pathname === `/docs#${section.id}` || pathname === "/docs";
            return (
              <a
                key={section.id}
                href={`/docs#${section.id}`}
                style={{
                  display: "block",
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: isActive ? "var(--color-gold-light)" : "var(--text-soft)",
                  textDecoration: "none",
                  borderRadius: "var(--radius-md)",
                  background: isActive ? "rgba(201,169,98,0.08)" : "transparent",
                  marginBottom: "2px",
                  transition: "all .15s ease",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(201,169,98,0.04)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {section.label}
              </a>
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
