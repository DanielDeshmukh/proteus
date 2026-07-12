const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://proteus-phi.vercel.app";

// ─── Shared branding ────────────────────────────────────

function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
</head>
<body style="margin:0;padding:0;background-color:#111315;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111315;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#1a1d21;border:1px solid rgba(201,169,98,0.12);border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:36px 36px 28px;text-align:center;border-bottom:1px solid rgba(201,169,98,0.08);">
              <div style="display:inline-block;width:34px;height:34px;border:2px solid #c9a962;border-radius:7px;transform:rotate(45deg);margin-bottom:18px;">
                <div style="position:relative;top:6px;left:6px;width:14px;height:14px;border:2px solid #dfc08a;border-radius:3px;"></div>
              </div>
              <h1 style="color:#f5f5f0;font-size:20px;font-weight:500;letter-spacing:0.06em;margin:0;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">PROTEUS</h1>
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
            <td style="padding:20px 36px;border-top:1px solid rgba(201,169,98,0.08);text-align:center;">
              <p style="color:#4b5563;font-size:11px;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                PROTEUS &mdash; AI Resume Analyzer &amp; Cover Letter Generator
              </p>
              <p style="color:#374151;font-size:10px;margin:6px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                <a href="${APP_URL}" style="color:#6b7280;text-decoration:underline;">Open PROTEUS</a>
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
    <h2 style="color:#f5f5f0;font-size:17px;font-weight:500;margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Sign in to your account</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      Click the button below to sign in to PROTEUS. This link will expire in 15 minutes.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${url}" style="display:inline-block;background:linear-gradient(180deg,#dfc08a,#c9a962);color:#111315;font-size:14px;font-weight:600;text-decoration:none;padding:13px 30px;border-radius:8px;letter-spacing:0.02em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            Sign in to PROTEUS
          </a>
        </td>
      </tr>
    </table>
    <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      If you didn't request this email, you can safely ignore it. The link will expire automatically.
    </p>`;
  return emailShell(body);
}

function magicLinkText(url: string): string {
  return emailText(
    `Sign in to your account\n\nClick this link to sign in:\n${url}\n\nThis link expires in 15 minutes.\nIf you didn't request this, ignore this email.`
  );
}

// ─── Welcome ────────────────────────────────────────────

function welcomeHtml(userName?: string): string {
  const greeting = userName ? `Hello ${userName},` : "Hello,";
  const body = `
    <h2 style="color:#f5f5f0;font-size:17px;font-weight:500;margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Welcome to PROTEUS</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      ${greeting}
    </p>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      You now have access to PROTEUS, an AI-powered resume analyzer that runs a five-agent pipeline to give you:
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="padding:0 0 10px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;background:rgba(201,169,98,0.06);border:1px solid rgba(201,169,98,0.12);border-radius:8px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="color:#e0c87a;font-size:13px;font-weight:500;margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Semantic Match Score</p>
                <p style="color:#9ca3af;font-size:12px;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">See how closely your resume aligns with the job description</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 10px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;background:rgba(201,169,98,0.06);border:1px solid rgba(201,169,98,0.12);border-radius:8px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="color:#e0c87a;font-size:13px;font-weight:500;margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Gap Analysis</p>
                <p style="color:#9ca3af;font-size:12px;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Identified gaps between your resume and role requirements</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 10px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;background:rgba(201,169,98,0.06);border:1px solid rgba(201,169,98,0.12);border-radius:8px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="color:#e0c87a;font-size:13px;font-weight:500;margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Bullet Rewrites &amp; Cover Letter</p>
                <p style="color:#9ca3af;font-size:12px;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">AI-drafted rewrites and a tailored cover letter</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${APP_URL}/analyze" style="display:inline-block;background:linear-gradient(180deg,#dfc08a,#c9a962);color:#111315;font-size:14px;font-weight:600;text-decoration:none;padding:13px 30px;border-radius:8px;letter-spacing:0.02em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            Start your first analysis
          </a>
        </td>
      </tr>
    </table>`;
  return emailShell(body);
}

function welcomeText(userName?: string): string {
  const greeting = userName ? `Hello ${userName},` : "Hello,";
  return emailText(
    `${greeting}\n\nWelcome to PROTEUS! You now have access to AI-powered resume analysis.\n\nWhat you can do:\n- Semantic match scoring against any job description\n- Gap analysis between your resume and role requirements\n- Bullet-level rewrites tailored to the job\n- AI-generated cover letters\n\nGet started: ${APP_URL}/analyze`
  );
}

// ─── Analysis Complete ──────────────────────────────────

function analysisCompleteHtml(score: number | null, runId: number): string {
  const scoreText = score != null ? `${Math.round(score * 100)}%` : "N/A";
  const scoreColor = score != null && score >= 0.75 ? "#e0c87a" : score != null && score >= 0.5 ? "#c9a962" : "#9ca3af";
  const body = `
    <h2 style="color:#f5f5f0;font-size:17px;font-weight:500;margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Analysis Complete</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      Your resume analysis has finished. Here's a summary:
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td align="center" style="padding:28px 20px;background:rgba(201,169,98,0.06);border:1px solid rgba(201,169,98,0.12);border-radius:10px;">
          <p style="color:#6b7280;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Match Score</p>
          <p style="color:${scoreColor};font-size:42px;font-weight:600;margin:0;line-height:1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${scoreText}</p>
        </td>
      </tr>
    </table>
    <p style="color:#9ca3af;font-size:13px;line-height:1.7;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      View your full results including gap analysis, rewrite suggestions, cover letter, and priority actions.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td align="center">
          <a href="${APP_URL}/history" style="display:inline-block;background:linear-gradient(180deg,#dfc08a,#c9a962);color:#111315;font-size:14px;font-weight:600;text-decoration:none;padding:13px 30px;border-radius:8px;letter-spacing:0.02em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            View results
          </a>
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
