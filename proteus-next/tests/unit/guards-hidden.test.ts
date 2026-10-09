import { describe, expect, it } from "vitest";
import { checkHiddenExperience } from "@/lib/guards/hidden";
import { RESUME_TEXT, cleanRewriteOutput } from "../fixtures/pipeline-fixtures";

describe("checkHiddenExperience", () => {
  it("keeps claims grounded in the resume", () => {
    const { kept, violations } = checkHiddenExperience(
      cleanRewriteOutput().hidden_experience,
      RESUME_TEXT
    );
    expect(kept).toHaveLength(1);
    expect(violations).toEqual([]);
  });

  it("drops claims the resume never supports", () => {
    const { kept, violations } = checkHiddenExperience(
      ["Machine learning model deployment at scale for trading systems"],
      RESUME_TEXT
    );
    expect(kept).toHaveLength(0);
    expect(violations.map((v) => v.code)).toContain("UNGROUND_HIDDEN");
  });

  it("drops empty and stopword-only claims", () => {
    const { kept, violations } = checkHiddenExperience(["   ", "and or of to in"], RESUME_TEXT);
    expect(kept).toHaveLength(0);
    expect(violations).toHaveLength(2);
  });
});
