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

  const t0 = performance.now();
  onProgress?.({ stage: "parsing" });

  // Stage 1: Parse JD and Resume in parallel (120s timeout each)
  try {
    const jdPromise = withTimeout(parseJd(jdText), 45_000, "JD parser").then(
      (val) => ({ status: "fulfilled" as const, value: val }),
      (reason) => ({ status: "rejected" as const, reason })
    );

    const resumePromise = withTimeout(parseResume(resumeText), 45_000, "Resume parser").then(
      (val) => ({ status: "fulfilled" as const, value: val }),
      (reason) => ({ status: "rejected" as const, reason })
    );

    const [jdResult, resumeResult] = await Promise.all([jdPromise, resumePromise]);

    if (jdResult.status === "fulfilled") {
      result.jd = jdResult.value;
      onProgress?.({ stage: "jd_parsed", data: jdResult.value });
    } else {
      result.errors.push(`JD parsing failed: ${jdResult.reason}`);
      return result;
    }

    if (resumeResult.status === "fulfilled") {
      result.resume = resumeResult.value;
      onProgress?.({ stage: "resume_parsed", data: resumeResult.value });
    } else {
      result.errors.push(`Resume parsing failed: ${resumeResult.reason}`);
      return result;
    }

    result.timings["parse"] = (performance.now() - t0) / 1000;
  } catch (e) {
    result.errors.push(`Parse stage failed: ${e}`);
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
  } catch (e) {
    result.errors.push(`Gap analysis failed: ${e}`);
    result.timings["gap_analysis"] = (performance.now() - t1) / 1000;
    // Gap analysis failure is non-fatal — we can still generate with null gaps
    // but downstream stages need it, so return
    return result;
  }

  // Stage 3: Rewrites and cover letter in parallel (180s timeout each)
  onProgress?.({ stage: "generating" });
  const t2 = performance.now();
  try {
    const rewritesPromise = withTimeout(
      suggestRewrites(result.jd, result.resume, result.gap_analysis),
      45_000,
      "Rewrite suggester"
    ).then(
      (val) => ({ status: "fulfilled" as const, value: val }),
      (reason) => ({ status: "rejected" as const, reason })
    );

    const coverPromise = withTimeout(
      generateCoverLetter(result.jd, result.resume, result.gap_analysis, coverLetterTone),
      55_000,
      "Cover letter"
    ).then(
      (val) => ({ status: "fulfilled" as const, value: val }),
      (reason) => ({ status: "rejected" as const, reason })
    );

    const [rewritesResult, coverResult] = await Promise.all([rewritesPromise, coverPromise]);

    if (rewritesResult.status === "fulfilled") {
      result.rewrites = rewritesResult.value;
      onProgress?.({ stage: "rewrites", data: rewritesResult.value });
    } else {
      result.errors.push(`Rewrite suggester failed: ${rewritesResult.reason}`);
    }

    if (coverResult.status === "fulfilled") {
      result.cover_letter = coverResult.value;
      onProgress?.({ stage: "cover_letter", data: coverResult.value });
    } else {
      result.errors.push(`Cover letter generator failed: ${coverResult.reason}`);
    }

    result.timings["generate"] = (performance.now() - t2) / 1000;
  } catch (e) {
    result.errors.push(`Generate stage failed: ${e}`);
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
  } catch (e) {
    result.errors.push(`Aggregation failed: ${e}`);
    result.timings["aggregate"] = (performance.now() - t3) / 1000;
  }

  return result;
}
