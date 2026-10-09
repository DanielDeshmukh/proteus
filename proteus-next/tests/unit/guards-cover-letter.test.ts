import { describe, expect, it } from "vitest";
import { checkCoverLetter } from "@/lib/guards/cover-letter";
import type { CoverLetterOutput } from "@/types";
import {
  CANDIDATE_NAME,
  JD_COMPANY,
  JD_TEXT,
  RESUME_TEXT,
  cleanCoverLetter,
} from "../fixtures/pipeline-fixtures";

const ctx = () => ({
  name: CANDIDATE_NAME,
  company: JD_COMPANY,
  sourceText: `${RESUME_TEXT}\n${JD_TEXT}`,
});

const codesOf = (out: CoverLetterOutput) => checkCoverLetter(out, ctx()).violations.map((v) => v.code);

describe("checkCoverLetter", () => {
  it("passes a clean, grounded letter with zero violations", () => {
    expect(codesOf(cleanCoverLetter())).toEqual([]);
  });

  it("flags bracketed placeholders", () => {
    const out = cleanCoverLetter();
    out.full_letter += "\n\nI look forward to speaking with [Company] soon.";
    expect(codesOf(out)).toContain("PLACEHOLDER");
  });

  it("flags a closing signed by the wrong person", () => {
    const out = cleanCoverLetter();
    out.full_letter = out.full_letter.replaceAll(CANDIDATE_NAME, "Jane Doe");
    out.sections = out.sections.map((s) => ({
      ...s,
      content: s.content.replaceAll(CANDIDATE_NAME, "Jane Doe"),
    }));
    expect(codesOf(out)).toContain("NAME_MISSING");
  });

  it("flags numbers that exist in neither resume nor JD", () => {
    const out = cleanCoverLetter();
    out.full_letter += "\n\nI grew revenue by 300% in my last role.";
    expect(codesOf(out)).toContain("NUMBER_NOT_IN_SOURCE");
  });

  it("flags mojibake garble", () => {
    const out = cleanCoverLetter();
    out.full_letter += "\n\nTrÃ© experiences.";
    expect(codesOf(out)).toContain("GARBLED");
  });

  it("flags degenerate repetition loops", () => {
    const out = cleanCoverLetter();
    out.full_letter += "\n\nGreat great great outcomes.";
    expect(codesOf(out)).toContain("REPETITION");
  });

  it("flags a wildly wrong word_count and returns the computed one", () => {
    const out = cleanCoverLetter();
    out.word_count = 99999;
    const check = checkCoverLetter(out, ctx());
    expect(check.violations.map((v) => v.code)).toContain("WORD_COUNT_WRONG");
    expect(check.computedWordCount).toBeGreaterThan(50);
  });

  it("flags sections that diverge from full_letter", () => {
    const out = cleanCoverLetter();
    out.sections = [
      {
        heading: "Only section",
        content:
          "A completely different draft that shares almost nothing with the main letter body and is far too short to cover it in any meaningful way at all.",
      },
    ];
    expect(codesOf(out)).toContain("SECTIONS_DIVERGE");
  });

  it("flags a letter that never names the company", () => {
    const out = cleanCoverLetter();
    out.full_letter = out.full_letter.replaceAll(JD_COMPANY, "your team");
    out.sections = out.sections.map((s) => ({
      ...s,
      content: s.content.replaceAll(JD_COMPANY, "your team"),
    }));
    expect(codesOf(out)).toContain("COMPANY_MISSING");
  });
});
