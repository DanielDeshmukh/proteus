import type { RewriteOutput, RewriteSuggestion } from "../../types";
import type { GuardViolation } from "./types";
import {
  countWords,
  diceSimilarity,
  extractNumbers,
  findGarbled,
  findPlaceholders,
  findRepetition,
  midSentenceProperNouns,
  normalize,
} from "./text";

export interface SuggestionsContext {
  /** Every bullet from the parsed resume (untruncated). */
  resumeBullets: string[];
  /** Raw resume text — proper nouns here are legitimate. */
  resumeText: string;
  /** Raw JD text — JD terms the rewrite is allowed to adopt. */
  jdText: string;
}

export interface SuggestionsCheck {
  /** Suggestions safe to keep (drop-level violations removed). */
  kept: RewriteSuggestion[];
  violations: GuardViolation[];
}

/** Drop: the suggestion leaks content that must never reach the export. */
const DROP_CODES = new Set([
  "ORIGINAL_NOT_IN_RESUME",
  "INVENTED_NUMBER",
  "NEW_PROPER_NOUN",
  "PLACEHOLDER",
  "GARBLED",
  "REPETITION",
]);

export function checkSuggestions(
  output: RewriteOutput,
  ctx: SuggestionsContext
): SuggestionsCheck {
  const violations: GuardViolation[] = [];
  const kept: RewriteSuggestion[] = [];

  const corpus = new Set(
    normalize(`${ctx.resumeText} ${ctx.jdText} ${ctx.resumeBullets.join(" ")}`).split(" ")
  );

  for (const s of output.suggestions ?? []) {
    const original = s.original_bullet ?? "";
    const rewrite = s.suggested_rewrite ?? "";
    const codes: GuardViolation["code"][] = [];
    const details: string[] = [];

    // 1. original must be a real resume bullet (near-exact)
    let best = 0;
    for (const bullet of ctx.resumeBullets) {
      const sim = diceSimilarity(original, bullet);
      if (sim > best) best = sim;
      if (best >= 0.95) break;
    }
    if (best < 0.85) {
      codes.push("ORIGINAL_NOT_IN_RESUME");
      details.push(`original_bullet matches resume only at ${best.toFixed(2)}`);
    }

    // 2. no placeholders / garble / loops in the rewrite
    const ph = findPlaceholders(rewrite);
    if (ph.length) {
      codes.push("PLACEHOLDER");
      details.push(`rewrite contains ${ph[0]}`);
    }
    const gar = findGarbled(rewrite);
    if (gar.length) {
      codes.push("GARBLED");
      details.push(gar[0]);
    }
    const rep = findRepetition(rewrite);
    if (rep.length) {
      codes.push("REPETITION");
      details.push(rep[0]);
    }

    // 3. every number in the rewrite must exist in the original bullet
    const origNums = extractNumbers(original);
    for (const n of extractNumbers(rewrite)) {
      if (!origNums.has(n)) {
        codes.push("INVENTED_NUMBER");
        details.push(`rewrite adds number "${n}" not in original bullet`);
        break;
      }
    }

    // 4. no proper nouns absent from resume + JD
    for (const pn of midSentenceProperNouns(rewrite)) {
      if (!corpus.has(pn.toLowerCase())) {
        codes.push("NEW_PROPER_NOUN");
        details.push(`rewrite introduces "${pn}" found in neither resume nor JD`);
        break;
      }
    }

    // 5. length sanity — warn only, does not drop
    if (countWords(rewrite) > countWords(original) * 1.8 + 5) {
      violations.push({
        code: "TOO_LONG",
        target: "rewrites",
        detail: `rewrite is ${countWords(rewrite)} words vs original ${countWords(original)} — kept, review manually`,
      });
    }

    if (codes.some((c) => DROP_CODES.has(c))) {
      for (let i = 0; i < codes.length; i++) {
        violations.push({
          code: codes[i],
          target: "rewrites",
          detail: `dropped "${original.slice(0, 60)}…" — ${details[i] ?? ""}`.trim(),
        });
      }
    } else {
      kept.push(s);
    }
  }

  return { kept, violations };
}
