import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/signin", "/verify-request", "/error", "/api/auth", "/api/health", "/docs"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return;
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return;
  }

  if (!req.auth) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
