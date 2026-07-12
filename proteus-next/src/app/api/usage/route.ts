import { NextResponse } from "next/server";
import { getUsageStats } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const stats = await getUsageStats(userId);
  return NextResponse.json(stats);
}
