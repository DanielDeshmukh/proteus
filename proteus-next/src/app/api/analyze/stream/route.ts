import { runPipeline } from "@/lib/agents";
import { saveRun, updateRun } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import type { Tone } from "@/types";

export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await auth();
  const formData = await request.formData();

  const jdText = formData.get("jd_text") as string | null;
  const resumeText = formData.get("resume_text") as string | null;
  const coverLetterTone = (formData.get("cover_letter_tone") as string) || "professional";

  if (!jdText?.trim()) {
    return new Response(JSON.stringify({ event: "error", message: "jd_text is required" }) + "\n", {
      status: 400,
      headers: { "Content-Type": "application/x-ndjson" },
    });
  }
  if (!resumeText?.trim()) {
    return new Response(JSON.stringify({ event: "error", message: "resume_text is required" }) + "\n", {
      status: 400,
      headers: { "Content-Type": "application/x-ndjson" },
    });
  }

  const validTones: Tone[] = ["professional", "enthusiastic", "concise"];
  const tone: Tone = validTones.includes(coverLetterTone as Tone)
    ? (coverLetterTone as Tone)
    : "professional";

  const runId = await saveRun({
    user_id: session?.user?.id || null,
    jd_text: jdText.trim(),
    jd_source: "paste",
    resume_text: resumeText.trim(),
    resume_source: "paste",
    status: "running",
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      send({ event: "started", run_id: runId });

      try {
        const result = await runPipeline(jdText.trim(), resumeText.trim(), tone);

        if (result.jd) {
          send({ event: "jd_parsed", data: result.jd });
        }
        if (result.resume) {
          send({ event: "resume_parsed", data: result.resume });
        }
        if (result.gap_analysis) {
          send({ event: "gap_analysis", data: result.gap_analysis });
        }
        if (result.rewrites) {
          send({ event: "rewrites", data: result.rewrites });
        }
        if (result.cover_letter) {
          send({ event: "cover_letter", data: result.cover_letter });
        }
        if (result.aggregated) {
          send({ event: "result", data: result.aggregated });
        }

        await updateRun(runId, {
          overall_score: result.aggregated?.overall_score ?? null,
          status: result.errors.length > 0 ? "partial" : "completed",
          error_message: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
        });

        send({ event: "done", run_id: runId });
      } catch (e) {
        await updateRun(runId, {
          status: "failed",
          error_message: e instanceof Error ? e.message : String(e),
        });
        send({ event: "error", message: e instanceof Error ? e.message : String(e) });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
