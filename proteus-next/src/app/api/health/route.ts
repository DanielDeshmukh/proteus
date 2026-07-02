import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "proteus-backend",
    env: process.env.NODE_ENV || "development",
    version: "2.0.0",
    framework: "nextjs",
  });
}
