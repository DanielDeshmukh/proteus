import { NextResponse } from "next/server";
import { listRuns } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const runs = listRuns(limit, offset);
  return NextResponse.json({ runs, count: runs.length });
}
