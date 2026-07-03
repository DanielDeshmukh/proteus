import { NextResponse } from "next/server";
import { getModelForRole } from "@/lib/model-config";
import { readFileSync } from "fs";
import { join } from "path";

const PIPELINE_STEPS = [
  {
    step: 1,
    agent: "JD Parser",
    role: "jd-parser",
    task: "Extract structured requirements",
    work: "Reads raw JD text and pulls out title, company, hard skills, soft skills, domain keywords, and ATS bait — everything an ATS would scan for.",
    icon: "01",
  },
  {
    step: 2,
    agent: "Resume Parser",
    role: "resume-parser",
    task: "Break resume into structured units",
    work: "Parses the candidate resume into name, skills, experience bullets, projects, education, and certifications — normalizing unstructured text into queryable data.",
    icon: "02",
  },
  {
    step: 3,
    agent: "Gap Analyzer",
    role: "gap-analyzer",
    task: "Score semantic match via embeddings",
    work: "Embeds every JD requirement and resume evidence into vectors, computes cosine similarity, then classifies each requirement as matched, partial, or missing.",
    icon: "03",
  },
  {
    step: 4,
    agent: "Rewrite Suggester",
    role: "rewrite-suggester",
    task: "Draft JD-aware bullet rewrites",
    work: "Takes the weakest gaps and existing resume bullets, then rewrites them to naturally incorporate JD keywords — keeping the candidate's actual experience truthful.",
    icon: "04",
  },
  {
    step: 5,
    agent: "Cover Letter",
    role: "cover-letter",
    task: "Write tailored cover letter",
    work: "Generates a full cover letter from the same parsed JD context — opening, why-this-role, key qualifications, and closing — matching the selected tone.",
    icon: "05",
  },
];

export async function GET() {
  try {
    const configPath = join(process.cwd(), "models.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8"));

    const models = PIPELINE_STEPS.map((step) => ({
      ...step,
      model: getModelForRole(step.role),
      lastChecked: config.lastHealthCheck,
    }));

    return NextResponse.json({
      models,
      lastHealthCheck: config.lastHealthCheck,
      lastHealthyModels: config.lastHealthyModels,
    });
  } catch (e) {
    return NextResponse.json(
      { detail: `Failed to load models: ${e instanceof Error ? e.message : e}` },
      { status: 500 }
    );
  }
}
