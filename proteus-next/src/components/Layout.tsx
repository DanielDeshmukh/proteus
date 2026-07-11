"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { path: "/analyze", label: "Analyze" },
  { path: "/models", label: "Models" },
  { path: "/history", label: "History" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

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

          {session?.user && (
            <div style={{ position: "relative", marginLeft: "24px" }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: "var(--surface-sunken)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", overflow: "hidden",
                }}
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-gold)" }}>
                    {(session.user.name || session.user.email || "?")[0].toUpperCase()}
                  </span>
                )}
              </button>
              {showMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setShowMenu(false)} />
                  <div style={{
                    position: "absolute", right: 0, top: "42px", zIndex: 50,
                    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                    minWidth: "200px", padding: "8px 0", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}>
                    <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", margin: 0 }}>{session.user.name || "User"}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-faint)", margin: 0, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>{session.user.email}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/signin" })}
                      style={{
                        display: "block", width: "100%", textAlign: "left", padding: "10px 16px",
                        fontSize: "13px", color: "var(--text-soft)", background: "none", border: "none",
                        cursor: "pointer", fontFamily: "var(--font-sans)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
