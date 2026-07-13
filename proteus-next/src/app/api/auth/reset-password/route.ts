import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { getUserByResetToken, resetPassword } from "@/lib/auth/adapter";

const BCRYPT_ROUNDS = 12;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const user = await getUserByResetToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await resetPassword(user.id, passwordHash);

    return NextResponse.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("[RESET-PASSWORD]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
