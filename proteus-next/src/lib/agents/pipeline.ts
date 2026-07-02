import type { JDStructured, ResumeStructured, GapAnalysis, RewriteOutput, CoverLetterOutput, PipelineOutput, Tone } from "../../types";
import { parseJd } from "./jd-parser";
import { parseResume } from "./resume-parser";
import { analyzeGaps } from "./gap-analyzer";
import { suggestRewrites } from "./rewrite-suggester";
import { generateCoverLetter } from "./cover-letter";
import { aggregateScores } from "./aggregator";

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

export async function runPipeline(
  jdText: string,
  resumeText: string,
  coverLetterTone: Tone = "professional"
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

  // Stage 1: Parse JD and Resume in parallel
  try {
    const [jdResult, resumeResult] = await Promise.allSettled([
      parseJd(jdText),
      parseResume(resumeText),
    ]);

    if (jdResult.status === "rejected") {
      result.errors.push(`JD parsing failed: ${jdResult.reason}`);
      return result;
    }
    if (resumeResult.status === "rejected") {
      result.errors.push(`Resume parsing failed: ${resumeResult.reason}`);
      return result;
    }

    result.jd = jdResult.value;
    result.resume = resumeResult.value;
    result.timings["parse"] = (performance.now() - t0) / 1000;
  } catch (e) {
    result.errors.push(`Parse stage failed: ${e}`);
    return result;
  }

  // Stage 2: Gap analysis
  const t1 = performance.now();
  try {
    result.gap_analysis = await analyzeGaps(result.jd, result.resume);
    result.timings["gap_analysis"] = (performance.now() - t1) / 1000;
  } catch (e) {
    result.errors.push(`Gap analysis failed: ${e}`);
    result.timings["gap_analysis"] = (performance.now() - t1) / 1000;
    return result;
  }

  // Stage 3: Rewrites and cover letter in parallel
  const t2 = performance.now();
  try {
    const [rewritesResult, coverResult] = await Promise.allSettled([
      suggestRewrites(result.jd, result.resume, result.gap_analysis),
      generateCoverLetter(result.jd, result.resume, result.gap_analysis, coverLetterTone),
    ]);

    if (rewritesResult.status === "fulfilled") {
      result.rewrites = rewritesResult.value;
    } else {
      result.errors.push(`Rewrite suggester failed: ${rewritesResult.reason}`);
    }

    if (coverResult.status === "fulfilled") {
      result.cover_letter = coverResult.value;
    } else {
      result.errors.push(`Cover letter generator failed: ${coverResult.reason}`);
    }

    result.timings["generate"] = (performance.now() - t2) / 1000;
  } catch (e) {
    result.errors.push(`Generate stage failed: ${e}`);
    result.timings["generate"] = (performance.now() - t2) / 1000;
  }

  // Stage 4: Aggregate scores
  const t3 = performance.now();
  try {
    result.aggregated = aggregateScores(result.gap_analysis);
    result.timings["aggregate"] = (performance.now() - t3) / 1000;
    result.timings["total"] = (performance.now() - t0) / 1000;
  } catch (e) {
    result.errors.push(`Aggregation failed: ${e}`);
    result.timings["aggregate"] = (performance.now() - t3) / 1000;
  }

  return result;
}
