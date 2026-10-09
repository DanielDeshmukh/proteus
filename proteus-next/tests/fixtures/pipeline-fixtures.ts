// Representative fixtures for hallucination/leakage guard tests.
// Derived from observed failure modes — NOT real user data (no PII).

import { countWords } from "../../src/lib/guards/text";
import type { CoverLetterOutput, RewriteOutput } from "../../src/types";

export const JD_TEXT = `Senior Data Engineer at Northwind Logistics
Requirements: 5+ years of Python, experience with Airflow and AWS, strong SQL skills.
Nice to have: Docker, data modeling.
`;

export const RESUME_TEXT = `Priya Sharma
Software Engineer

Experience:
Acme Corp (2021-2024)
- Built data pipelines processing 40% more throughput with Airflow
- Led a team of 12 engineers migrating services to AWS

Education:
B.Tech Computer Science, IIT Delhi, 2020

Skills: Python, AWS, Airflow, SQL, Docker
`;

export const CANDIDATE_NAME = "Priya Sharma";
export const JD_COMPANY = "Northwind Logistics";

export const RESUME_BULLETS = [
  "Built data pipelines processing 40% more throughput with Airflow",
  "Led a team of 12 engineers migrating services to AWS",
];

const CLEAN_LETTER_BODY = `Dear Hiring Manager,

I am writing to apply for the Senior Data Engineer role at Northwind Logistics. At Acme Corp I built data pipelines that increased processing throughput by 40% using Airflow, and led a team of 12 engineers migrating services to AWS.

My background in Python, SQL, and Docker maps directly to your requirements. I hold a B.Tech in Computer Science from IIT Delhi and have worked with Airflow daily since 2021.

I would welcome the chance to bring this experience to Northwind Logistics.

Sincerely,
Priya Sharma`;

const CLEAN_SECTIONS = [
  { heading: "Opening", content: "I am writing to apply for the Senior Data Engineer role at Northwind Logistics. At Acme Corp I built data pipelines that increased processing throughput by 40% using Airflow, and led a team of 12 engineers migrating services to AWS." },
  { heading: "Why This Role", content: "My background in Python, SQL, and Docker maps directly to your requirements. I hold a B.Tech in Computer Science from IIT Delhi and have worked with Airflow daily since 2021." },
  { heading: "Closing", content: "I would welcome the chance to bring this experience to Northwind Logistics. Sincerely, Priya Sharma" },
];

/** A cover letter that passes every guard (word_count computed, not guessed). */
export function cleanCoverLetter(): CoverLetterOutput {
  return {
    job_title: "Senior Data Engineer",
    full_letter: CLEAN_LETTER_BODY,
    sections: CLEAN_SECTIONS.map((s) => ({ ...s })),
    tone: "professional",
    key_points_addressed: ["5+ years Python", "Airflow", "AWS"],
    word_count: countWords(CLEAN_LETTER_BODY),
  };
}

/** A rewrite that passes every guard. */
export function cleanRewriteOutput(): RewriteOutput {
  return {
    suggestions: [
      {
        original_bullet: RESUME_BULLETS[0],
        suggested_rewrite:
          "Built and optimized Airflow data pipelines that increased processing throughput by 40%, cutting batch latency across upstream sources",
        rationale: "Leads with impact and JD keywords",
        target_requirement: "experience with Airflow and AWS",
        impact_score: 0.8,
      },
    ],
    hidden_experience: ["Airflow pipeline orchestration experience"],
  };
}
