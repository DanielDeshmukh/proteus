import { Link, useLocation } from "react-router-dom"

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/history", label: "History" },
]

export function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-10"
        style={{
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{
            maxWidth: "1180px",
            padding: "20px 40px",
          }}
        >
          <Link to="/" className="flex items-center" style={{ gap: "12px" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                border: "1.5px solid var(--color-gold)",
                borderRadius: "7px",
                position: "relative",
                transform: "rotate(45deg)",
                flexShrink: 0,
                display: "inline-block",
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
                to={item.path}
                style={{
                  fontSize: "14px",
                  color: location.pathname === item.path ? "var(--color-gold-light)" : "var(--text-soft)",
                  position: "relative",
                  paddingBottom: "4px",
                  transition: "color .15s ease",
                }}
              >
                {item.label}
                {location.pathname === item.path && (
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
          padding: "0 40px 96px",
        }}
      >
        {children}
      </main>
    </div>
  )
}
