import { saveRun, updateRun, closeDb } from "./src/lib/db";

const SAMPLE_RUNS = [
  {
    jd_text: "Senior Software Engineer at Google\n\nRequirements:\n- 5+ years of experience in Python or Go\n- Strong background in distributed systems\n- Experience with cloud platforms (GCP, AWS)\n- BS/MS in Computer Science or equivalent\n- Experience with Kubernetes and container orchestration",
    jd_source: "paste",
    resume_text: "Jane Smith\n\nSenior Software Engineer at Meta (2021-2024)\n- Led migration of 200+ microservices to Kubernetes, reducing deployment time by 60%\n- Built real-time data pipeline processing 1M events/sec using Kafka and Flink\n- Implemented distributed caching layer serving 10K RPS with 99.99% uptime\n\nSkills: Python, Go, Kubernetes, GCP, AWS, Kafka, Flink, PostgreSQL, Redis",
    resume_source: "paste",
    status: "completed",
    overall_score: 87.5,
    section_scores: JSON.stringify({ skills_match: 92, experience_match: 85, education_match: 90, keyword_coverage: 83 }),
    gap_analysis: JSON.stringify([
      { skill: "Open source contributions", severity: "medium", impact: 5 },
      { skill: "ML infrastructure experience", severity: "low", impact: 3 },
    ]),
    cover_letter: JSON.stringify({
      job_title: "Senior Software Engineer",
      tone: "professional",
      body: "Dear Hiring Manager,\n\nI am excited to apply for the Senior Software Engineer position at Google. With over 5 years of experience in distributed systems and cloud platforms, I bring a strong track record of building and scaling high-performance systems.\n\nBest regards,\nJane Smith",
    }),
    action_list: JSON.stringify([
      { action: "Add open source contributions to GitHub profile", priority: "high", impact: 5 },
      { action: "Highlight GCP-specific experience more prominently", priority: "medium", impact: 3 },
    ]),
  },
  {
    jd_text: "Product Manager at Netflix\n\nAbout the role:\nWe're looking for a Product Manager to lead our content discovery experience.\n\nRequirements:\n- 3+ years product management experience\n- Experience with recommendation systems or personalization\n- Strong analytical skills and data-driven decision making",
    jd_source: "paste",
    resume_text: "Alex Johnson\n\nAssociate Product Manager at Spotify (2022-2024)\n- Owned the 'Discover Weekly' playlist feature, increasing engagement by 15%\n- Led A/B testing framework improvements, reducing experiment cycle time by 40%\n\nSkills: SQL, Python, A/B testing, user research, stakeholder management",
    resume_source: "paste",
    status: "completed",
    overall_score: 78.2,
    section_scores: JSON.stringify({ skills_match: 75, experience_match: 82, education_match: 85, keyword_coverage: 70 }),
    gap_analysis: JSON.stringify([
      { skill: "3+ years PM experience", severity: "medium", impact: 8 },
    ]),
    cover_letter: JSON.stringify({
      job_title: "Product Manager",
      tone: "enthusiastic",
      body: "Dear Netflix Hiring Team,\n\nI've been a passionate Netflix user for years, and I'm thrilled to apply for the Product Manager role.\n\nBest,\nAlex Johnson",
    }),
    action_list: JSON.stringify([
      { action: "Gain additional PM experience before reapplying", priority: "high", impact: 8 },
    ]),
  },
  {
    jd_text: "Junior Frontend Developer at Startup Co\n\nLooking for a junior developer to join our small team!\n\nRequirements:\n- 1-2 years experience with React\n- Basic understanding of HTML, CSS, JavaScript\n- Eagerness to learn and grow",
    jd_source: "url",
    resume_text: "Sam Lee\n\nWeb Development Bootcamp Graduate (2024)\n- Completed 500+ hours of full-stack development training\n- Built 5 React projects including an e-commerce site\n\nSkills: HTML, CSS, JavaScript, React, Node.js, PostgreSQL",
    resume_source: "paste",
    status: "completed",
    overall_score: 62.0,
    section_scores: JSON.stringify({ skills_match: 68, experience_match: 45, education_match: 70, keyword_coverage: 65 }),
    gap_analysis: JSON.stringify([
      { skill: "Professional work experience", severity: "high", impact: 15 },
    ]),
    cover_letter: JSON.stringify({
      job_title: "Junior Frontend Developer",
      tone: "enthusiastic",
      body: "Dear Startup Co Team,\n\nI'm excited to apply for the Junior Frontend Developer position.\n\nBest,\nSam Lee",
    }),
    action_list: JSON.stringify([
      { action: "Build more complex projects to demonstrate experience depth", priority: "high", impact: 15 },
    ]),
  },
];

async function seed() {
  console.log("Seeding database...");

  for (const run of SAMPLE_RUNS) {
    const runId = await saveRun({
      jd_text: run.jd_text,
      jd_source: run.jd_source,
      resume_text: run.resume_text,
      resume_source: run.resume_source,
      status: "pending",
    });

    await updateRun(runId, {
      overall_score: run.overall_score,
      section_scores: run.section_scores,
      gap_analysis: run.gap_analysis,
      cover_letter: run.cover_letter,
      action_list: run.action_list,
      status: run.status,
    });

    console.log(`  Created run ${runId}: ${run.jd_text.substring(0, 50)}...`);
  }

  console.log(`\nSeeded ${SAMPLE_RUNS.length} demo runs`);
  closeDb();
}

seed();
