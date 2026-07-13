import NextAuth from "next-auth";
import Email from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { createTursoAdapter, getUserByEmailWithPassword } from "./adapter";
import { authConfig } from "./auth.config";
import { sendMagicLinkEmail } from "./email";
import { signinSchema } from "./validation";

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
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ to: identifier, url });
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const parsed = signinSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });
        if (!parsed.success) return null;

        const user = await getUserByEmailWithPassword(parsed.data.email);
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
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
