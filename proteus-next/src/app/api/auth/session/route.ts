import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export async function GET() {
  const session = await auth();
  return NextResponse.json(session || { user: null });
}
