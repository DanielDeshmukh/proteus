import { NextResponse } from "next/server";
import { getUsageStats } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const stats = await getUsageStats(userId);
    return NextResponse.json(stats);
  } catch (e) {
    console.error("GET /api/usage error:", e);
    return NextResponse.json(
      { error: "Failed to load usage", detail: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
