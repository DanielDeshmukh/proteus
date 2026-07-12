import { NextResponse } from "next/server";
import { listRuns } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const runs = await listRuns(limit, offset, session?.user?.id || undefined);
  return NextResponse.json({ runs, count: runs.length });
}
