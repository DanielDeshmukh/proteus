import NextAuth from "next-auth";
import Email from "next-auth/providers/email";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { createTursoAdapter } from "./adapter";
import { authConfig } from "./auth.config";

const adapter = createTursoAdapter();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  ...authConfig,
  adapter,
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
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
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id?: string } }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.id && session.user) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
});
