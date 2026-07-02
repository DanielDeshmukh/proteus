import { NextResponse } from "next/server";
import { getRun, deleteRun } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const runId = parseInt(id, 10);

  if (isNaN(runId)) {
    return NextResponse.json({ detail: "Invalid run ID" }, { status: 400 });
  }

  const run = getRun(runId);
  if (!run) {
    return NextResponse.json({ detail: `Run ${runId} not found` }, { status: 404 });
  }

  return NextResponse.json(run);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const runId = parseInt(id, 10);

  if (isNaN(runId)) {
    return NextResponse.json({ detail: "Invalid run ID" }, { status: 400 });
  }

  const deleted = deleteRun(runId);
  if (!deleted) {
    return NextResponse.json({ detail: `Run ${runId} not found` }, { status: 404 });
  }

  return NextResponse.json({ deleted: true, run_id: runId });
}
