"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { path: "/analyze", label: "Analyze" },
  { path: "/models", label: "Models" },
  { path: "/history", label: "History" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>
      <header
        className="sticky top-0 z-10"
        style={{
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: "1180px", padding: "20px 40px" }}
        >
          <Link href="/" className="flex items-center" style={{ gap: "12px" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                border: "1.5px solid var(--color-gold)",
                borderRadius: "7px",
                transform: "rotate(45deg)",
                display: "inline-block",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: "6px",
                  border: "1.5px solid var(--color-gold-light)",
                  borderRadius: "3px",
                }}
              />
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "21px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text)",
              }}
            >
              Proteus
            </span>
          </Link>

          <nav className="flex" style={{ gap: "36px" }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  fontSize: "14px",
                  color:
                    pathname === item.path || (item.path === "/analyze" && pathname === "/")
                      ? "var(--color-gold-light)"
                      : "var(--text-soft)",
                  position: "relative",
                  paddingBottom: "4px",
                  transition: "color .15s ease",
                }}
              >
                {item.label}
                {(pathname === item.path || (item.path === "/analyze" && pathname === "/")) && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: "-9px",
                      height: "2px",
                      background: "var(--color-gold)",
                      borderRadius: "2px",
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main
        className="mx-auto"
        style={{
          maxWidth: "1180px",
          padding: "8px 48px 120px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>
    </div>
  );
}
