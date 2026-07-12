import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/agents";
import { saveRun, updateRun, checkRateLimit, incrementRateLimit } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import type { Tone } from "@/types";

export const maxDuration = 300;

const DAILY_LIMIT = 10;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Rate limit check
  const rateLimit = await checkRateLimit(userId, "analyze", DAILY_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Daily limit reached",
        message: `You've used ${rateLimit.current} of ${rateLimit.limit} analyses today. Limit resets tomorrow.`,
        used: rateLimit.current,
        limit: rateLimit.limit,
        resetsAt: rateLimit.resetsAt,
      },
      { status: 429 }
    );
  }

  const formData = await request.formData();

  const jdText = formData.get("jd_text") as string | null;
  const jdUrl = formData.get("jd_url") as string | null;
  const jdFile = formData.get("jd_file") as File | null;
  const resumeText = formData.get("resume_text") as string | null;
  const resumeFile = formData.get("resume_file") as File | null;
  const coverLetterTone = (formData.get("cover_letter_tone") as string) || "professional";

  // Resolve JD
  let resolvedJd = jdText?.trim() || null;
  if (!resolvedJd && jdUrl) {
    try {
      const { fetchJdFromUrl } = await import("@/lib/jd-url-fetcher");
      resolvedJd = await fetchJdFromUrl(jdUrl);
    } catch (e) {
      return NextResponse.json(
        { detail: `Failed to fetch JD from URL: ${e instanceof Error ? e.message : e}` },
        { status: 400 }
      );
    }
  }
  if (!resolvedJd && jdFile) {
    const buffer = Buffer.from(await jdFile.arrayBuffer());
    const filename = jdFile.name?.toLowerCase() || "";
    if (filename.endsWith(".pdf")) {
      const { parsePdfBuffer } = await import("@/lib/pdf-parser");
      resolvedJd = await parsePdfBuffer(buffer);
    } else if (filename.endsWith(".docx")) {
      const { parseDocxBuffer } = await import("@/lib/docx-parser");
      resolvedJd = await parseDocxBuffer(buffer);
    } else {
      resolvedJd = buffer.toString("utf-8");
    }
  }

  if (!resolvedJd) {
    return NextResponse.json(
      { detail: "No job description provided (text, URL, or file)" },
      { status: 400 }
    );
  }

  // Resolve Resume
  let resolvedResume = resumeText?.trim() || null;
  if (!resolvedResume && resumeFile) {
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const filename = resumeFile.name?.toLowerCase() || "";
    if (filename.endsWith(".pdf")) {
      const { parsePdfBuffer } = await import("@/lib/pdf-parser");
      resolvedResume = await parsePdfBuffer(buffer);
    } else if (filename.endsWith(".docx")) {
      const { parseDocxBuffer } = await import("@/lib/docx-parser");
      resolvedResume = await parseDocxBuffer(buffer);
    } else {
      resolvedResume = buffer.toString("utf-8");
    }
  }

  if (!resolvedResume) {
    return NextResponse.json(
      { detail: "No resume provided (text or file)" },
      { status: 400 }
    );
  }

  // Validate tone
  const validTones: Tone[] = ["professional", "enthusiastic", "concise"];
  const tone: Tone = validTones.includes(coverLetterTone as Tone)
    ? (coverLetterTone as Tone)
    : "professional";

  // Save run
  const runId = await saveRun({
    user_id: session?.user?.id || null,
    jd_text: resolvedJd,
    jd_source: jdText ? "paste" : jdUrl ? "url" : "file",
    resume_text: resolvedResume,
    resume_source: resumeText ? "paste" : "file",
    status: "running",
  });

  try {
    const result = await runPipeline(resolvedJd, resolvedResume, tone);

    await updateRun(runId, {
      overall_score: result.aggregated?.overall_score ?? null,
      section_scores: result.aggregated ? JSON.stringify(result.aggregated.section_scores) : null,
      gap_analysis: result.gap_analysis ? JSON.stringify(result.gap_analysis) : null,
      rewrite_suggestions: result.rewrites ? JSON.stringify(result.rewrites) : null,
      cover_letter: result.cover_letter ? JSON.stringify(result.cover_letter) : null,
      action_list: result.aggregated ? JSON.stringify(result.aggregated.action_list) : null,
      status: result.errors.length > 0 ? "partial" : "completed",
      error_message: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
    });

    await incrementRateLimit(userId, "analyze");

    return NextResponse.json({
      run_id: runId,
      overall_score: result.aggregated?.overall_score ?? null,
      section_scores: result.aggregated?.section_scores ?? null,
      gap_analysis: result.gap_analysis ?? null,
      rewrite_suggestions: result.rewrites ?? null,
      cover_letter: result.cover_letter ?? null,
      action_list: result.aggregated?.action_list ?? null,
      timings: result.timings,
      errors: result.errors.length > 0 ? result.errors : null,
    });
  } catch (e) {
    await updateRun(runId, {
      status: "failed",
      error_message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { detail: `Pipeline failed: ${e instanceof Error ? e.message : e}` },
      { status: 500 }
    );
  }
}
