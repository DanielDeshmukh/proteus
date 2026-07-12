"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const navItems = [
  { path: "/analyze", label: "Analyze" },
  { path: "/models", label: "Models" },
  { path: "/history", label: "History" },
  { path: "/docs", label: "Docs" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    setShowMobileNav(false);
  }, [pathname]);

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
          }}
          className="sm:!px-10"
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                border: "1.5px solid var(--color-gold)",
                borderRadius: "7px",
                transform: "rotate(45deg)",
                display: "inline-block",
                position: "relative",
                flexShrink: 0,
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

          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: "36px" }} className="hide-mobile">
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
                  textDecoration: "none",
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

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* User avatar (desktop) */}
            {session?.user && (
              <div style={{ position: "relative" }} className="hide-mobile">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "var(--surface-sunken)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    overflow: "hidden",
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
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "42px",
                        zIndex: 50,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        minWidth: "200px",
                        padding: "8px 0",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", margin: 0 }}>{session.user.name || "User"}</p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--text-faint)",
                            margin: 0,
                            marginTop: "2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "180px",
                          }}
                        >
                          {session.user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: "/signin" })}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 16px",
                          fontSize: "13px",
                          color: "var(--text-soft)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
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

            {/* Mobile hamburger */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--text)",
                width: "32px",
                height: "32px",
                alignItems: "center",
                justifyContent: "center",
              }}
              className={`!flex md:!hidden ${showMobileNav ? "hamburger-open" : ""}`}
              aria-label="Toggle navigation"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line className="hamburger-line" x1="3" y1="5" x2="17" y2="5" />
                <line className="hamburger-line" x1="3" y1="10" x2="17" y2="10" />
                <line className="hamburger-line" x1="3" y1="15" x2="17" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {showMobileNav && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "8px 24px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
            className="mobile-nav-enter md:!hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  fontSize: "14px",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  color:
                    pathname === item.path || (item.path === "/analyze" && pathname === "/")
                      ? "var(--color-gold-light)"
                      : "var(--text-soft)",
                  background:
                    pathname === item.path || (item.path === "/analyze" && pathname === "/")
                      ? "rgba(201,169,98,0.08)"
                      : "transparent",
                  textDecoration: "none",
                  transition: "background .15s ease",
                }}
              >
                {item.label}
              </Link>
            ))}
            {session?.user && (
              <>
                <div style={{ height: "1px", background: "var(--border)", margin: "8px 0" }} />
                <div style={{ padding: "8px 12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", margin: 0 }}>{session.user.name || "User"}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-faint)", margin: 0, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>{session.user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/signin" })}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    fontSize: "13px",
                    color: "var(--text-soft)",
                    background: "none",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <main
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "8px 24px 120px",
          position: "relative",
          zIndex: 1,
        }}
        className="sm:!px-12"
      >
        {children}
      </main>
    </div>
  );
}
