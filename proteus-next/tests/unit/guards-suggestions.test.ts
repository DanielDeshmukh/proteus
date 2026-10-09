import { describe, expect, it } from "vitest";
import { checkSuggestions } from "@/lib/guards/suggestions";
import {
  JD_TEXT,
  RESUME_BULLETS,
  RESUME_TEXT,
  cleanRewriteOutput,
} from "../fixtures/pipeline-fixtures";

const ctx = () => ({
  resumeBullets: [...RESUME_BULLETS],
  resumeText: RESUME_TEXT,
  jdText: JD_TEXT,
});

describe("checkSuggestions", () => {
  it("keeps a clean, grounded suggestion", () => {
    const { kept, violations } = checkSuggestions(cleanRewriteOutput(), ctx());
    expect(kept).toHaveLength(1);
    expect(violations).toEqual([]);
  });

  it("drops suggestions whose original_bullet is not a real resume bullet", () => {
    const out = cleanRewriteOutput();
    out.suggestions.push({
      original_bullet: "Designed a quant trading platform in Singapore",
      suggested_rewrite: "Designed a quant trading platform handling 5M orders daily",
      rationale: "n/a",
      target_requirement: "n/a",
      impact_score: 0.9,
    });
    const { kept, violations } = checkSuggestions(out, ctx());
    expect(kept).toHaveLength(1);
    expect(violations.map((v) => v.code)).toContain("ORIGINAL_NOT_IN_RESUME");
    expect(kept.some((s) => s.original_bullet.includes("quant trading"))).toBe(false);
  });

  it("drops rewrites that invent numbers absent from the original bullet", () => {
    const out = cleanRewriteOutput();
    out.suggestions[0] = {
      ...out.suggestions[0],
      suggested_rewrite: "Built Airflow pipelines that increased throughput by 60% company-wide",
    };
    const { kept, violations } = checkSuggestions(out, ctx());
    expect(kept).toHaveLength(0);
    expect(violations.map((v) => v.code)).toContain("INVENTED_NUMBER");
  });

  it("drops rewrites that introduce tools absent from resume and JD", () => {
    const out = cleanRewriteOutput();
    out.suggestions[0] = {
      ...out.suggestions[0],
      suggested_rewrite:
        "Built data pipelines with Airflow and orchestrated Kubernetes workloads across clusters",
    };
    const { kept, violations } = checkSuggestions(out, ctx());
    expect(kept).toHaveLength(0);
    expect(violations.map((v) => v.code)).toContain("NEW_PROPER_NOUN");
  });

  it("drops rewrites containing placeholder text", () => {
    const out = cleanRewriteOutput();
    out.suggestions[0] = {
      ...out.suggestions[0],
      suggested_rewrite: "Led a team delivering projects using [tool] and [framework]",
    };
    const { kept, violations } = checkSuggestions(out, ctx());
    expect(kept).toHaveLength(0);
    expect(violations.map((v) => v.code)).toContain("PLACEHOLDER");
  });

  it("warns but keeps overly long rewrites", () => {
    const out = cleanRewriteOutput();
    out.suggestions[0] = {
      ...out.suggestions[0],
      suggested_rewrite:
        `Built data pipelines processing 40% more throughput with Airflow ${"and then proceeded to continuously refine every single stage of the orchestration layer while mentoring peers and documenting each migration step in detail".repeat(2)}`,
    };
    const { kept, violations } = checkSuggestions(out, ctx());
    expect(kept).toHaveLength(1);
    expect(violations.map((v) => v.code)).toContain("TOO_LONG");
  });

  it("keeps JD terms the rewrite is allowed to adopt", () => {
    const out = cleanRewriteOutput();
    out.suggestions[0] = {
      ...out.suggestions[0],
      // "Docker" is in the resume; "SQL" too — both must pass
      suggested_rewrite:
        "Built data pipelines processing 40% more throughput with Airflow, backed by SQL models containerized in Docker",
    };
    const { kept } = checkSuggestions(out, ctx());
    expect(kept).toHaveLength(1);
  });
});
