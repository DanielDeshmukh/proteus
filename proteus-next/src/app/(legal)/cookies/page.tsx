import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — PROTEUS",
  description: "How PROTEUS uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-soft)", textDecoration: "none", marginBottom: "32px", fontFamily: "var(--font-sans)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to PROTEUS
        </a>

        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px, 5vw, 36px)", color: "var(--text)", marginBottom: "12px" }}>Cookie Policy</h1>
        <p style={{ fontSize: "13px", color: "var(--text-faint)", marginBottom: "40px", fontFamily: "var(--font-mono)" }}>Last updated: July 14, 2026</p>

        <div style={{ fontSize: "14.5px", color: "var(--text-soft)", lineHeight: 1.8, fontFamily: "var(--font-sans)" }}>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and maintain your session.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>2. How PROTEUS Uses Cookies</h2>
            <p style={{ marginBottom: "12px" }}>PROTEUS uses minimal cookies, strictly necessary for the Service to function:</p>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "16px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "var(--text)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Cookie</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "var(--text)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Purpose</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "var(--text)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", color: "var(--color-gold)", fontSize: "12.5px" }}>next-auth.session-token</td>
                    <td style={{ padding: "12px 16px" }}>Maintains your authenticated session</td>
                    <td style={{ padding: "12px 16px" }}>30 days</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", color: "var(--color-gold)", fontSize: "12.5px" }}>next-auth.callback-url</td>
                    <td style={{ padding: "12px 16px" }}>Stores the URL to redirect to after sign-in</td>
                    <td style={{ padding: "12px 16px" }}>Session</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", color: "var(--color-gold)", fontSize: "12.5px" }}>next-auth.csrf-token</td>
                    <td style={{ padding: "12px 16px" }}>Protects against cross-site request forgery</td>
                    <td style={{ padding: "12px 16px" }}>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>3. What We Don&apos;t Use</h2>
            <ul style={{ paddingLeft: "20px" }}>
              <li style={{ marginBottom: "6px" }}>No advertising or tracking cookies</li>
              <li style={{ marginBottom: "6px" }}>No analytics cookies (no Google Analytics, Mixpanel, etc.)</li>
              <li style={{ marginBottom: "6px" }}>No social media tracking pixels</li>
              <li style={{ marginBottom: "6px" }}>No third-party marketing cookies</li>
            </ul>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>4. Managing Cookies</h2>
            <p style={{ marginBottom: "12px" }}>
              Since PROTEUS only uses strictly necessary cookies, disabling them will prevent the Service from functioning (you won&apos;t be able to sign in).
            </p>
            <p>
              You can clear cookies at any time through your browser settings. This will sign you out and clear your session.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>5. Contact</h2>
            <p>
              Questions about cookies? Contact us at{" "}
              <a href="mailto:deshmukhdaniel2005@gmail.com" style={{ color: "var(--color-gold)", textDecoration: "none" }}>deshmukhdaniel2005@gmail.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
