import { NextResponse } from "next/server";
import crypto from "crypto";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { setPasswordResetToken, getUserByEmailWithPassword } from "@/lib/auth/adapter";
import { sendEmail } from "@/lib/auth/email";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://proteus-phi.vercel.app";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await getUserByEmailWithPassword(email);

    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link was sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + RESET_TOKEN_EXPIRY_MS;
    await setPasswordResetToken(email, token, expires);

    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your PROTEUS password",
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0d0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f11;padding:32px 16px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#1a1d21;border:1px solid rgba(201,169,98,0.2);border-radius:16px;overflow:hidden;">
<tr><td style="height:3px;background:linear-gradient(90deg,#c9a962,#dfc08a,#c9a962);"></td></tr>
<tr><td style="padding:36px 36px 28px;text-align:center;">
<h1 style="color:#f5f5f0;font-size:20px;font-weight:600;margin:0 0 16px;">Reset your password</h1>
<p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 28px;">
  Click the button below to set a new password. This link expires in 1 hour.
</p>
<a href="${resetUrl}" style="display:inline-block;background:linear-gradient(180deg,#dfc08a,#c9a962);color:#111315;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">Reset password</a>
<p style="color:#6b7280;font-size:12px;margin:28px 0 0;line-height:1.6;">
  If you didn't request this, you can safely ignore this email.
</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
      text: `Reset your PROTEUS password\n\nClick this link to set a new password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    });

    return NextResponse.json({ message: "If an account exists, a reset link was sent." });
  } catch (err) {
    console.error("[FORGOT-PASSWORD]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
