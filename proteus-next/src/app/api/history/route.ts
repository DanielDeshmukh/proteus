import { NextResponse } from "next/server";
import { listRuns } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const runs = await listRuns(limit, offset, userId || undefined);
    return NextResponse.json({ runs, count: runs.length });
  } catch (e) {
    console.error("GET /api/history error:", e);
    return NextResponse.json(
      { error: "Failed to load history", detail: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
