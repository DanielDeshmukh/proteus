import type { CoverLetterOutput } from "../../types";
import type { GuardViolation } from "./types";
import {
  countWords,
  extractNumbers,
  findGarbled,
  findPlaceholders,
  findRepetition,
  normalize,
} from "./text";

export interface CoverLetterContext {
  /** Exact candidate name from the parsed resume. */
  name: string;
  /** Company from the JD — checked only when present and meaningful. */
  company?: string | null;
  /** Raw resume + JD text — every number in the letter must exist here. */
  sourceText: string;
}

export interface CoverLetterCheck {
  violations: GuardViolation[];
  /** Corrected word count (model estimates drift). */
  computedWordCount: number;
}

const push = (violations: GuardViolation[], code: GuardViolation["code"], detail: string) =>
  violations.push({ code, target: "cover_letter", detail });

export function checkCoverLetter(
  output: CoverLetterOutput,
  ctx: CoverLetterContext
): CoverLetterCheck {
  const violations: GuardViolation[] = [];
  const letter = output.full_letter ?? "";
  const computedWordCount = countWords(letter);

  // 1. Placeholders / banned phrases
  for (const p of findPlaceholders(letter)) {
    push(violations, "PLACEHOLDER", `full_letter contains ${p}`);
  }
  for (const section of output.sections ?? []) {
    for (const p of findPlaceholders(`${section.heading} ${section.content}`)) {
      push(violations, "PLACEHOLDER", `section "${section.heading || "?"}" contains ${p}`);
    }
  }

  // 2. Garbled output (mojibake, control chars, U+FFFD)
  for (const g of findGarbled(letter)) push(violations, "GARBLED", g);

  // 3. Degeneration loops (repeated words / sentences)
  for (const r of findRepetition(letter)) push(violations, "REPETITION", r);

  // 4. Candidate name must appear in the closing (last 30% of the letter)
  const name = (ctx.name || "").trim();
  if (name && name.length >= 2) {
    const closing = letter.slice(Math.floor(letter.length * 0.7));
    if (!normalize(closing).includes(normalize(name))) {
      push(violations, "NAME_MISSING", `closing does not contain candidate name "${name}"`);
    }
  }

  // 5. Company must be addressed when the JD provides one
  const company = (ctx.company || "").trim();
  if (company.length >= 2 && !letter.toLowerCase().includes(company.toLowerCase())) {
    push(violations, "COMPANY_MISSING", `letter never mentions company "${company}"`);
  }

  // 6. Every number in the letter must exist in the resume or JD
  const sourceNumbers = extractNumbers(ctx.sourceText);
  for (const n of extractNumbers(letter)) {
    if (!sourceNumbers.has(n)) {
      push(violations, "NUMBER_NOT_IN_SOURCE", `letter contains number "${n}" absent from source documents`);
    }
  }

  // 7. word_count must be within 25% of reality
  if (output.word_count && computedWordCount > 0) {
    const drift = Math.abs(output.word_count - computedWordCount) / computedWordCount;
    if (drift > 0.25) {
      push(
        violations,
        "WORD_COUNT_WRONG",
        `claimed ${output.word_count}, actual ${computedWordCount}`
      );
    }
  }

  // 8. sections must be consistent with full_letter (not an independent draft)
  const sectionsText = (output.sections ?? []).map((s) => s.content).join(" ").trim();
  if (sectionsText.length > 100 && letter.length > 100) {
    const a = normalize(sectionsText);
    const b = normalize(letter);
    const shorter = Math.min(a.length, b.length);
    const longer = Math.max(a.length, b.length);
    if (shorter / longer < 0.5) {
      push(
        violations,
        "SECTIONS_DIVERGE",
        `sections cover ${Math.round((shorter / longer) * 100)}% of full_letter`
      );
    }
  }

  return { violations, computedWordCount };
}
