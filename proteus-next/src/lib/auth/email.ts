const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://proteus-phi.vercel.app";

// ─── Shared branding ────────────────────────────────────

function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
</head>
<body style="margin:0;padding:0;background-color:#0d0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Full-width dark wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0f11;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#1a1d21;border:1px solid rgba(201,169,98,0.2);border-radius:16px;overflow:hidden;">
          <!-- Gold top accent -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#c9a962,#dfc08a,#c9a962);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding:36px 36px 28px;text-align:center;border-bottom:1px solid rgba(201,169,98,0.1);">
              <div style="display:inline-block;width:38px;height:38px;border:2.5px solid #c9a962;border-radius:9px;transform:rotate(45deg);margin-bottom:18px;">
                <div style="position:relative;top:7px;left:7px;width:16px;height:16px;border:2.5px solid #dfc08a;border-radius:4px;"></div>
              </div>
              <h1 style="color:#f5f5f0;font-size:22px;font-weight:600;letter-spacing:0.08em;margin:0;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">PROTEUS</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;border-top:1px solid rgba(201,169,98,0.1);text-align:center;">
              <p style="color:#6b7280;font-size:11px;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                PROTEUS &mdash; AI Resume Analyzer &amp; Cover Letter Generator
              </p>
              <p style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                <a href="${APP_URL}" style="color:#c9a962;font-size:11px;text-decoration:none;">Open PROTEUS &rarr;</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailText(content: string): string {
  return `PROTEUS — AI Resume Analyzer & Cover Letter Generator\n\n${content}\n\nOpen PROTEUS: ${APP_URL}`;
}

// ─── Magic Link ─────────────────────────────────────────

function magicLinkHtml(url: string): string {
  const body = `
    <h2 style="color:#f5f5f0;font-size:18px;font-weight:500;margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Sign in to your account</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      Click the button below to sign in to PROTEUS. This link will expire in 15 minutes.
    </p>
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:linear-gradient(180deg,#dfc08a,#c9a962);border-radius:10px;">
                <a href="${url}" style="display:inline-block;color:#111315;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:0.02em;">
                  Sign in to PROTEUS
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!-- Divider -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="border-bottom:1px solid rgba(201,169,98,0.15);"></td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      If you didn&rsquo;t request this email, you can safely ignore it. The link will expire automatically.
    </p>`;
  return emailShell(body);
}

function magicLinkText(url: string): string {
  return emailText(
    `Sign in to your account\n\nClick this link to sign in:\n${url}\n\nThis link expires in 15 minutes.\nIf you didn't request this, ignore this email.`
  );
}

// ─── Welcome ────────────────────────────────────────────

function featureRow(icon: string, title: string, desc: string): string {
  return `
    <tr>
      <td style="padding:0 0 10px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:rgba(201,169,98,0.06);border:1px solid rgba(201,169,98,0.18);border-radius:10px;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="color:#dfc08a;font-size:13px;font-weight:600;margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                ${icon} ${title}
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                ${desc}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function welcomeHtml(userName?: string): string {
  const greeting = userName ? `Hello ${userName},` : "Hello,";
  const body = `
    <h2 style="color:#f5f5f0;font-size:18px;font-weight:500;margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Welcome to PROTEUS</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      ${greeting}
    </p>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      You now have access to an AI-powered resume analyzer that runs a five-agent pipeline:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
      ${featureRow("&#9733;", "Semantic Match Score", "See how closely your resume aligns with the job description")}
      ${featureRow("&#9830;", "Gap Analysis", "Identified gaps between your resume and role requirements")}
      ${featureRow("&#10003;", "Bullet Rewrites &amp; Cover Letter", "AI-drafted rewrites and a tailored cover letter")}
    </table>
    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:20px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:linear-gradient(180deg,#dfc08a,#c9a962);border-radius:10px;">
                <a href="${APP_URL}/analyze" style="display:inline-block;color:#111315;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:0.02em;">
                  Start your first analysis
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  return emailShell(body);
}

function welcomeText(userName?: string): string {
  const greeting = userName ? `Hello ${userName},` : "Hello,";
  return emailText(
    `${greeting}\n\nWelcome to PROTEUS! You now have access to AI-powered resume analysis.\n\nWhat you can do:\n  ★  Semantic match scoring against any job description\n  ◆  Gap analysis between your resume and role requirements\n  ✓  Bullet-level rewrites tailored to the job\n  ✓  AI-generated cover letters\n\nGet started: ${APP_URL}/analyze`
  );
}

// ─── Analysis Complete ──────────────────────────────────

function analysisCompleteHtml(score: number | null, runId: number): string {
  const scoreText = score != null ? `${Math.round(score * 100)}%` : "N/A";
  const scoreColor = score != null && score >= 0.75 ? "#dfc08a" : score != null && score >= 0.5 ? "#c9a962" : "#9ca3af";
  const scoreLabel = score != null && score >= 0.75 ? "Strong match" : score != null && score >= 0.5 ? "Moderate match" : "Needs improvement";
  const body = `
    <h2 style="color:#f5f5f0;font-size:18px;font-weight:500;margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Analysis Complete</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      Your resume analysis has finished. Here&rsquo;s your match score:
    </p>
    <!-- Score card -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
      <tr>
        <td align="center" style="padding:32px 24px;background:rgba(201,169,98,0.08);border:1px solid rgba(201,169,98,0.25);border-radius:12px;">
          <p style="color:#6b7280;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Match Score</p>
          <p style="color:${scoreColor};font-size:48px;font-weight:700;margin:0;line-height:1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${scoreText}</p>
          <p style="color:#9ca3af;font-size:12px;margin:10px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${scoreLabel}</p>
        </td>
      </tr>
    </table>
    <p style="color:#9ca3af;font-size:13px;line-height:1.7;margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      View your full results including gap analysis, rewrite suggestions, cover letter, and priority actions.
    </p>
    <!-- CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:linear-gradient(180deg,#dfc08a,#c9a962);border-radius:10px;">
                <a href="${APP_URL}/history" style="display:inline-block;color:#111315;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:0.02em;">
                  View results
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  return emailShell(body);
}

function analysisCompleteText(score: number | null, runId: number): string {
  const scoreText = score != null ? `${Math.round(score * 100)}%` : "N/A";
  return emailText(
    `Analysis Complete\n\nMatch Score: ${scoreText}\nRun ID: #${runId}\n\nView your full results including gap analysis, rewrite suggestions, cover letter, and priority actions.\n\nView results: ${APP_URL}/history`
  );
}

// ─── Exports ────────────────────────────────────────────

export interface EmailParams {
  to: string;
  url?: string;
  token?: string;
  userName?: string;
  score?: number | null;
  runId?: number;
}

export async function sendMagicLinkEmail({ to, url }: EmailParams) {
  if (!url) throw new Error("url is required for magic link email");
  await sendEmail({
    to,
    subject: "Sign in to PROTEUS",
    html: magicLinkHtml(url),
    text: magicLinkText(url),
  });
}

export async function sendWelcomeEmail({ to, userName }: EmailParams) {
  await sendEmail({
    to,
    subject: "Welcome to PROTEUS",
    html: welcomeHtml(userName),
    text: welcomeText(userName),
  });
}

export async function sendAnalysisCompleteEmail({ to, score, runId }: EmailParams) {
  await sendEmail({
    to,
    subject: `Your PROTEUS analysis is ready — Score: ${score != null ? Math.round(score * 100) + "%" : "N/A"}`,
    html: analysisCompleteHtml(score ?? null, runId ?? 0),
    text: analysisCompleteText(score ?? null, runId ?? 0),
  });
}

// ─── Transport ──────────────────────────────────────────

async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const apiKey = process.env.SMTP_PASS || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[EMAIL] No SMTP_PASS set. Skipping "${subject}" to ${to}`);
    return;
  }

  const host = process.env.SMTP_HOST || "smtp.resend.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const from = process.env.EMAIL_FROM || "PROTEUS <onboarding@resend.dev>";

  const nodemailer = await import("nodemailer");
  const transport = nodemailer.default.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER || "resend",
      pass: apiKey,
    },
  });

  await transport.sendMail({ from, to, subject, html, text });
}
