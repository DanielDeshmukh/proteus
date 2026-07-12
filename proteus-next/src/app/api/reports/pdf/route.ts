import { NextResponse } from "next/server";
import { getRun } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { generateReport } from "@/lib/pdf-report";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const runId = parseInt(searchParams.get("run_id") || "0", 10);
  if (!runId) {
    return NextResponse.json({ error: "run_id is required" }, { status: 400 });
  }

  const run = await getRun(runId);
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  if (run.user_id && run.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse JSON fields
  let sectionScores: Record<string, number> | null = null;
  let gapAnalysis: unknown = null;
  let rewriteSuggestions: unknown = null;
  let coverLetter: unknown = null;
  let actionList: unknown = null;

  try { if (run.section_scores) sectionScores = JSON.parse(run.section_scores); } catch {}
  try { if (run.gap_analysis) gapAnalysis = JSON.parse(run.gap_analysis); } catch {}
  try { if (run.rewrite_suggestions) rewriteSuggestions = JSON.parse(run.rewrite_suggestions); } catch {}
  try { if (run.cover_letter) coverLetter = JSON.parse(run.cover_letter); } catch {}
  try { if (run.action_list) actionList = JSON.parse(run.action_list); } catch {}

  const doc = generateReport({
    runId: run.id,
    createdAt: run.created_at,
    jdText: run.jd_text,
    jdSource: run.jd_source,
    resumeText: run.resume_text,
    resumeSource: run.resume_source,
    overallScore: run.overall_score,
    sectionScores,
    gapAnalysis: gapAnalysis as never,
    rewriteSuggestions: rewriteSuggestions as never,
    coverLetter: coverLetter as never,
    actionList: actionList as never,
  });

  const pdfBytes = doc.output("arraybuffer");

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="proteus-report-${runId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
