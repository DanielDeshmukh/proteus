import type { JDStructured, ResumeStructured, GapAnalysis, RewriteOutput, CoverLetterOutput, PipelineOutput, Tone } from "../../types";
import { parseJd } from "./jd-parser";
import { parseResume } from "./resume-parser";
import { analyzeGaps } from "./gap-analyzer";
import { suggestRewrites } from "./rewrite-suggester";
import { generateCoverLetter } from "./cover-letter";
import { aggregateScores } from "./aggregator";

export type ProgressEvent =
  | { stage: "parsing" }
  | { stage: "jd_parsed"; data: JDStructured }
  | { stage: "resume_parsed"; data: ResumeStructured }
  | { stage: "analyzing" }
  | { stage: "gap_analysis"; data: GapAnalysis }
  | { stage: "generating" }
  | { stage: "rewrites"; data: RewriteOutput }
  | { stage: "cover_letter"; data: CoverLetterOutput }
  | { stage: "aggregating" }
  | { stage: "result"; data: PipelineOutput };

export interface PipelineResult {
  jd: JDStructured | null;
  resume: ResumeStructured | null;
  gap_analysis: GapAnalysis | null;
  rewrites: RewriteOutput | null;
  cover_letter: CoverLetterOutput | null;
  aggregated: PipelineOutput | null;
  timings: Record<string, number>;
  errors: string[];
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

export async function runPipeline(
  jdText: string,
  resumeText: string,
  coverLetterTone: Tone = "professional",
  onProgress?: (event: ProgressEvent) => void
): Promise<PipelineResult> {
  const result: PipelineResult = {
    jd: null,
    resume: null,
    gap_analysis: null,
    rewrites: null,
    cover_letter: null,
    aggregated: null,
    timings: {},
    errors: [],
  };

  function extractErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err !== null && "message" in err) return String((err as { message: unknown }).message);
    if (typeof err === "string") return err;
    return String(err);
  }

  const t0 = performance.now();
  onProgress?.({ stage: "parsing" });

  // Stage 1: Parse JD and Resume in parallel (120s timeout each)
  try {
    const jdPromise = withTimeout(parseJd(jdText), 90_000, "JD parser").then(
      (val) => ({ status: "fulfilled" as const, value: val }),
      (reason) => ({ status: "rejected" as const, reason })
    );

    const resumePromise = withTimeout(parseResume(resumeText), 90_000, "Resume parser").then(
      (val) => ({ status: "fulfilled" as const, value: val }),
      (reason) => ({ status: "rejected" as const, reason })
    );

    const [jdResult, resumeResult] = await Promise.all([jdPromise, resumePromise]);

    if (jdResult.status === "fulfilled") {
      result.jd = jdResult.value;
      onProgress?.({ stage: "jd_parsed", data: jdResult.value });
      console.log("[Pipeline] JD parsed OK");
    } else {
      const msg = extractErrorMessage(jdResult.reason);
      console.error("[Pipeline] JD parsing failed:", msg);
      result.errors.push(`JD parsing failed: ${msg}`);
      return result;
    }

    if (resumeResult.status === "fulfilled") {
      result.resume = resumeResult.value;
      onProgress?.({ stage: "resume_parsed", data: resumeResult.value });
      console.log("[Pipeline] Resume parsed OK");
    } else {
      const msg = extractErrorMessage(resumeResult.reason);
      console.error("[Pipeline] Resume parsing failed:", msg);
      result.errors.push(`Resume parsing failed: ${msg}`);
      return result;
    }

    result.timings["parse"] = (performance.now() - t0) / 1000;
  } catch (e) {
    result.errors.push(`Parse stage failed: ${extractErrorMessage(e)}`);
    result.timings["parse"] = (performance.now() - t0) / 1000;
    return result;
  }

  // Stage 2: Gap analysis (60s timeout)
  onProgress?.({ stage: "analyzing" });
  const t1 = performance.now();
  try {
    result.gap_analysis = await withTimeout(
      analyzeGaps(result.jd, result.resume),
      30_000,
      "Gap analysis"
    );
    result.timings["gap_analysis"] = (performance.now() - t1) / 1000;
    onProgress?.({ stage: "gap_analysis", data: result.gap_analysis });
    console.log("[Pipeline] Gap analysis OK");
  } catch (e) {
    const msg = extractErrorMessage(e);
    console.error("[Pipeline] Gap analysis failed:", msg);
    result.errors.push(`Gap analysis failed: ${msg}`);
    result.timings["gap_analysis"] = (performance.now() - t1) / 1000;
    return result;
  }

  // Stage 3: Rewrites and cover letter in parallel (180s timeout each)
  onProgress?.({ stage: "generating" });
  const t2 = performance.now();
  try {
    const rewritesPromise = withTimeout(
      suggestRewrites(result.jd, result.resume, result.gap_analysis),
      90_000,
      "Rewrite suggester"
    ).then(
      (val) => ({ status: "fulfilled" as const, value: val }),
      (reason) => ({ status: "rejected" as const, reason })
    );

    const coverPromise = withTimeout(
      generateCoverLetter(result.jd, result.resume, result.gap_analysis, coverLetterTone),
      60_000,
      "Cover letter"
    ).then(
      (val) => ({ status: "fulfilled" as const, value: val }),
      (reason) => ({ status: "rejected" as const, reason })
    );

    const [rewritesResult, coverResult] = await Promise.all([rewritesPromise, coverPromise]);

    if (rewritesResult.status === "fulfilled") {
      result.rewrites = rewritesResult.value;
      onProgress?.({ stage: "rewrites", data: rewritesResult.value });
      console.log("[Pipeline] Rewrites OK");
    } else {
      const msg = extractErrorMessage(rewritesResult.reason);
      console.error("[Pipeline] Rewrites failed:", msg);
      result.errors.push(`Rewrite suggester failed: ${msg}`);
    }

    if (coverResult.status === "fulfilled") {
      result.cover_letter = coverResult.value;
      onProgress?.({ stage: "cover_letter", data: coverResult.value });
      console.log("[Pipeline] Cover letter OK");
    } else {
      const msg = extractErrorMessage(coverResult.reason);
      console.error("[Pipeline] Cover letter failed:", msg);
      result.errors.push(`Cover letter generator failed: ${msg}`);
    }

    result.timings["generate"] = (performance.now() - t2) / 1000;
  } catch (e) {
    result.errors.push(`Generate stage failed: ${extractErrorMessage(e)}`);
    result.timings["generate"] = (performance.now() - t2) / 1000;
  }

  // Stage 4: Aggregate scores
  onProgress?.({ stage: "aggregating" });
  const t3 = performance.now();
  try {
    result.aggregated = aggregateScores(result.gap_analysis);
    result.timings["aggregate"] = (performance.now() - t3) / 1000;
    result.timings["total"] = (performance.now() - t0) / 1000;
    onProgress?.({ stage: "result", data: result.aggregated });
    console.log("[Pipeline] Aggregation OK, overall:", result.aggregated?.overall_score);
  } catch (e) {
    const msg = extractErrorMessage(e);
    console.error("[Pipeline] Aggregation failed:", msg);
    result.errors.push(`Aggregation failed: ${msg}`);
    result.timings["aggregate"] = (performance.now() - t3) / 1000;
  }

  return result;
}
