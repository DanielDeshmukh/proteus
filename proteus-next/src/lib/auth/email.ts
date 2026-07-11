interface MagicLinkEmailParams {
  to: string;
  url: string;
  token: string;
}

function generateMagicLinkHtml(url: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#111315;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111315;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#1a1d23;border:1px solid rgba(201,169,98,0.15);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(201,169,98,0.1);">
              <div style="display:inline-block;width:36px;height:36px;border:2px solid #c9a962;border-radius:8px;transform:rotate(45deg);margin-bottom:20px;">
                <div style="position:relative;top:7px;left:7px;width:16px;height:16px;border:2px solid #dfc08a;border-radius:3px;"></div>
              </div>
              <h1 style="color:#f5f5f0;font-size:22px;font-weight:500;letter-spacing:0.06em;margin:0;text-transform:uppercase;">PROTEUS</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="color:#f5f5f0;font-size:18px;font-weight:500;margin:0 0 16px;">Sign in to your account</h2>
              <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 28px;">
                Click the button below to sign in to PROTEUS. This link will expire in 15 minutes.
              </p>
              <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${url}" style="display:inline-block;background:linear-gradient(180deg,#dfc08a,#c9a962);color:#111315;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.02em;">
                      Sign in to PROTEUS
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;">
                If you didn't request this email, you can safely ignore it. The link will expire automatically.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(201,169,98,0.1);text-align:center;">
              <p style="color:#4b5563;font-size:11px;margin:0;">
                PROTEUS — AI Resume Analyzer &amp; Cover Letter Generator
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

function generateMagicLinkText(url: string): string {
  return `Sign in to PROTEUS\n\nClick this link to sign in:\n${url}\n\nThis link expires in 15 minutes.\nIf you didn't request this, ignore this email.\n\nPROTEUS — AI Resume Analyzer & Cover Letter Generator`;
}

export async function sendMagicLinkEmail({ to, url }: MagicLinkEmailParams) {
  const apiKey = process.env.SMTP_PASS || process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[AUTH] No SMTP_PASS/RESEND_API_KEY set. Magic link:", url);
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

  await transport.sendMail({
    from,
    to,
    subject: "Sign in to PROTEUS",
    text: generateMagicLinkText(url),
    html: generateMagicLinkHtml(url),
  });
}
