import { NextResponse } from "next/server";
import { getRun, deleteRun } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const runId = parseInt(id, 10);

    if (isNaN(runId)) {
      return NextResponse.json({ error: "Invalid run ID" }, { status: 400 });
    }

    const run = await getRun(runId);
    if (!run) {
      return NextResponse.json({ error: `Run ${runId} not found` }, { status: 404 });
    }

    if (run.user_id && run.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(run);
  } catch (e) {
    console.error("GET /api/history/[id] error:", e);
    return NextResponse.json(
      { error: "Failed to load run", detail: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const runId = parseInt(id, 10);

    if (isNaN(runId)) {
      return NextResponse.json({ error: "Invalid run ID" }, { status: 400 });
    }

    const run = await getRun(runId);
    if (!run) {
      return NextResponse.json({ error: `Run ${runId} not found` }, { status: 404 });
    }

    if (run.user_id && run.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteRun(runId);
    return NextResponse.json({ deleted: true, run_id: runId });
  } catch (e) {
    console.error("DELETE /api/history/[id] error:", e);
    return NextResponse.json(
      { error: "Failed to delete run", detail: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
