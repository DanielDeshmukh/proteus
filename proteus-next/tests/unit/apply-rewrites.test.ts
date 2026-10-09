import { describe, expect, it } from "vitest";
import { applyRewrites } from "@/lib/resume-export";
import { checkSuggestions } from "@/lib/guards/suggestions";
import { RESUME_TEXT, cleanRewriteOutput } from "../fixtures/pipeline-fixtures";

const TWO_SIMILAR_BULLETS = `John Doe
Experience:
Acme Corp
- Increased sales by 25% in Q4 2023
- Increased sales by 40% in Q3 2023
`;

describe("applyRewrites — leakage regressions", () => {
  it("replaces only the targeted bullet, never a similar neighbour", () => {
    const result = applyRewrites(TWO_SIMILAR_BULLETS, [
      {
        // paraphrased/truncated original — the risky fuzzy-match path
        original_bullet: "Increased sales by 40% in Q3",
        suggested_rewrite: "Boosted quarterly sales by 40% through a redesigned pipeline",
      },
    ]);
    expect(result.appliedCount).toBe(1);
    expect(result.unmatched).toEqual([]);
    expect(result.text).toContain("Increased sales by 25% in Q4 2023");
    expect(result.text).toContain("Boosted quarterly sales by 40%");
    expect(result.text).not.toContain("Increased sales by 40% in Q3 2023");
  });

  it("reports unmatched suggestions instead of corrupting the resume", () => {
    const result = applyRewrites(TWO_SIMILAR_BULLETS, [
      {
        original_bullet: "Designed a quant trading platform in Singapore",
        suggested_rewrite: "Something entirely fabricated",
      },
    ]);
    expect(result.appliedCount).toBe(0);
    expect(result.unmatched).toHaveLength(1);
    expect(result.text).toBe(TWO_SIMILAR_BULLETS);
  });

  it("replaces wrapped multi-line bullets without leaving orphan tails", () => {
    const wrapped = `Jane Roe
Experience:
- Led a migration of legacy services across three regions
  with zero downtime during the cutover window
- Mentored 4 junior engineers
`;
    const result = applyRewrites(wrapped, [
      {
        original_bullet:
          "Led a migration of legacy services across three regions with zero downtime during the cutover window",
        suggested_rewrite: "Led a zero-downtime migration of legacy services across 3 regions",
      },
    ]);
    expect(result.appliedCount).toBe(1);
    expect(result.text).not.toContain("zero downtime during the cutover window");
    expect(result.text).toContain("zero-downtime migration of legacy services across 3 regions");
    expect(result.text).toContain("Mentored 4 junior engineers");
  });

  it("round-trips through the guards: fabricated suggestions never reach the export", () => {
    const out = cleanRewriteOutput();
    out.suggestions.push({
      original_bullet: "Designed a quant trading platform in Singapore",
      suggested_rewrite: "Designed a quant trading platform handling 5M orders daily",
      rationale: "fabricated",
      target_requirement: "fabricated",
      impact_score: 0.99,
    });

    const checked = checkSuggestions(out, {
      resumeBullets: [
        "Built data pipelines processing 40% more throughput with Airflow",
        "Led a team of 12 engineers migrating services to AWS",
      ],
      resumeText: RESUME_TEXT,
      jdText: "",
    });
    expect(checked.kept).toHaveLength(1);

    const result = applyRewrites(RESUME_TEXT, checked.kept);
    expect(result.appliedCount).toBe(1);
    expect(result.text).not.toContain("quant trading");
    expect(result.text).toContain("cutting batch latency");
    expect(result.text).toContain("Led a team of 12 engineers migrating services to AWS");
  });
});
