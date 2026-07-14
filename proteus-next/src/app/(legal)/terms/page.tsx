import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — PROTEUS",
  description: "Terms and conditions governing the use of PROTEUS AI Resume Analyzer.",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-soft)", textDecoration: "none", marginBottom: "32px", fontFamily: "var(--font-sans)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to PROTEUS
        </a>

        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(28px, 5vw, 36px)", color: "var(--text)", marginBottom: "12px" }}>Terms of Service</h1>
        <p style={{ fontSize: "13px", color: "var(--text-faint)", marginBottom: "40px", fontFamily: "var(--font-mono)" }}>Last updated: July 14, 2026</p>

        <div style={{ fontSize: "14.5px", color: "var(--text-soft)", lineHeight: 1.8, fontFamily: "var(--font-sans)" }}>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>1. Acceptance of Terms</h2>
            <p style={{ marginBottom: "12px" }}>
              By accessing or using PROTEUS (&quot;the Service&quot;), operated at proteus-phi.vercel.app, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
            <p>
              We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>2. Description of Service</h2>
            <p style={{ marginBottom: "12px" }}>
              PROTEUS is an AI-powered resume analysis tool that provides:
            </p>
            <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
              <li style={{ marginBottom: "6px" }}>Semantic match scoring between your resume and a job description</li>
              <li style={{ marginBottom: "6px" }}>Gap analysis identifying missing qualifications</li>
              <li style={{ marginBottom: "6px" }}>AI-suggested bullet point rewrites</li>
              <li style={{ marginBottom: "6px" }}>Tailored cover letter generation</li>
            </ul>
            <p>
              All AI analysis is performed using third-party language models via the NVIDIA NIM API. Results are generated probabilistically and should be reviewed by the user before use.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>3. User Accounts</h2>
            <p style={{ marginBottom: "12px" }}>
              You may create an account using email and password, or via third-party OAuth (Google, GitHub). You are responsible for:
            </p>
            <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
              <li style={{ marginBottom: "6px" }}>Maintaining the confidentiality of your credentials</li>
              <li style={{ marginBottom: "6px" }}>All activity that occurs under your account</li>
              <li style={{ marginBottom: "6px" }}>Notifying us immediately of any unauthorized access</li>
            </ul>
            <p>
              You must be at least 13 years old to create an account. One account per person.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>4. Acceptable Use</h2>
            <p style={{ marginBottom: "12px" }}>You agree not to:</p>
            <ul style={{ paddingLeft: "20px" }}>
              <li style={{ marginBottom: "6px" }}>Use the Service for any unlawful purpose</li>
              <li style={{ marginBottom: "6px" }}>Attempt to circumvent rate limits or abuse the API</li>
              <li style={{ marginBottom: "6px" }}>Upload malicious content or files containing malware</li>
              <li style={{ marginBottom: "6px" }}>Create multiple accounts to bypass usage limits</li>
              <li style={{ marginBottom: "6px" }}>Reverse engineer or attempt to extract the underlying models or prompt logic</li>
              <li style={{ marginBottom: "6px" }}>Resell or redistribute PROTEUS outputs without attribution</li>
            </ul>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>5. Intellectual Property</h2>
            <p style={{ marginBottom: "12px" }}>
              The Service, including its design, code, branding, and documentation, is owned by PROTEUS and protected by copyright and trademark laws.
            </p>
            <p>
              You retain full ownership of your uploaded resumes and job descriptions. By using the Service, you grant PROTEUS a temporary, non-exclusive license to process your content solely for the purpose of generating analysis results. Your content is not used to train AI models.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>6. AI-Generated Content Disclaimer</h2>
            <p style={{ marginBottom: "12px" }}>
              Analysis results, match scores, rewrite suggestions, and cover letters are generated by AI language models. These outputs:
            </p>
            <ul style={{ paddingLeft: "20px" }}>
              <li style={{ marginBottom: "6px" }}>May contain inaccuracies or hallucinations</li>
              <li style={{ marginBottom: "6px" }}>Are not guaranteed to be factually correct</li>
              <li style={{ marginBottom: "6px" }}>Should be reviewed and edited by you before submission</li>
              <li style={{ marginBottom: "6px" }}>Do not constitute professional career advice</li>
            </ul>
            <p>
              PROTEUS is not responsible for outcomes resulting from use of AI-generated content in job applications.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>7. Rate Limits and Availability</h2>
            <p style={{ marginBottom: "12px" }}>
              Free accounts are limited to 10 analyses per 24-hour period. We reserve the right to modify rate limits with notice.
            </p>
            <p>
              The Service is provided &quot;as is&quot; without uptime guarantees. We may perform maintenance, suspend access, or discontinue features at our discretion.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, PROTEUS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim, or $0 if you used the free tier.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>9. Termination</h2>
            <p>
              We may suspend or terminate your account at any time for violation of these terms. You may delete your account at any time by contacting us. Upon termination, your data will be deleted within 30 days.
            </p>
          </section>

          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>10. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Maharashtra, India.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "14px" }}>11. Contact</h2>
            <p>
              Questions about these terms? Reach us at{" "}
              <a href="mailto:deshmukhdaniel2005@gmail.com" style={{ color: "var(--color-gold)", textDecoration: "none" }}>deshmukhdaniel2005@gmail.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
