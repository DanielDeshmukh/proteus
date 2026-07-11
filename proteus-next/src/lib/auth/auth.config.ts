import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Email from "next-auth/providers/email";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify-request",
    error: "/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    Email({
      server: {
        host: process.env.SMTP_HOST || "smtp.resend.com",
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER || "resend",
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.EMAIL_FROM || "PROTEUS <onboarding@resend.dev>",
    }),
  ],
} satisfies NextAuthConfig;
