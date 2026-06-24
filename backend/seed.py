"""Seed the database with sample application runs for demo purposes."""

import asyncio
import json
from datetime import UTC, datetime, timedelta

from db.sqlite_store import DB_PATH, init_db, save_run, update_run


SAMPLE_RUNS = [
    {
        "jd_text": "Senior Software Engineer at Google\n\nRequirements:\n- 5+ years of experience in Python or Go\n- Strong background in distributed systems\n- Experience with cloud platforms (GCP, AWS)\n- BS/MS in Computer Science or equivalent\n- Experience with Kubernetes and container orchestration\n\nNice to have:\n- Contributions to open source projects\n- Experience with ML infrastructure\n- Publications in systems conferences",
        "jd_source": "paste",
        "resume_text": "Jane Smith\n\nSenior Software Engineer at Meta (2021-2024)\n- Led migration of 200+ microservices to Kubernetes, reducing deployment time by 60%\n- Built real-time data pipeline processing 1M events/sec using Kafka and Flink\n- Implemented distributed caching layer serving 10K RPS with 99.99% uptime\n\nSoftware Engineer at Stripe (2019-2021)\n- Designed and built payment reconciliation system handling $2B+ annually\n- Reduced API latency by 40% through query optimization and caching\n- Mentored 3 junior engineers through the promotion process\n\nEducation:\n- MS Computer Science, Stanford University (2019)\n- BS Computer Science, UC Berkeley (2017)\n\nSkills: Python, Go, Kubernetes, GCP, AWS, Kafka, Flink, PostgreSQL, Redis",
        "resume_source": "paste",
        "status": "completed",
        "overall_score": 87.5,
        "section_scores": json.dumps({
            "skills_match": 92,
            "experience_match": 85,
            "education_match": 90,
            "keyword_coverage": 83,
        }),
        "gap_analysis": json.dumps([
            {"skill": "Open source contributions", "severity": "medium", "impact": 5},
            {"skill": "ML infrastructure experience", "severity": "low", "impact": 3},
        ]),
        "rewrite_suggestions": json.dumps([
            {
                "original": "Led migration of 200+ microservices to Kubernetes",
                "rewritten": "Led migration of 200+ microservices to Kubernetes on GCP, implementing GitOps workflows with ArgoCD and reducing deployment time by 60%",
                "gap_addressed": "GCP experience",
            },
        ]),
        "cover_letter": json.dumps({
            "job_title": "Senior Software Engineer",
            "tone": "professional",
            "body": "Dear Hiring Manager,\n\nI am excited to apply for the Senior Software Engineer position at Google. With over 5 years of experience in distributed systems and cloud platforms, I bring a strong track record of building and scaling high-performance systems.\n\nAt Meta, I led the migration of 200+ microservices to Kubernetes, directly aligning with your requirements for container orchestration expertise. My experience with GCP and real-time data pipelines demonstrates my ability to work with the scale and complexity of Google's infrastructure.\n\nI am particularly drawn to Google's commitment to open source and would welcome the opportunity to contribute to projects that impact millions of developers worldwide.\n\nBest regards,\nJane Smith",
        }),
        "action_list": json.dumps([
            {"action": "Add open source contributions to GitHub profile", "priority": "high", "impact": 5},
            {"action": "Highlight GCP-specific experience more prominently", "priority": "medium", "impact": 3},
        ]),
    },
    {
        "jd_text": "Product Manager at Netflix\n\nAbout the role:\nWe're looking for a Product Manager to lead our content discovery experience. You'll work at the intersection of data science, engineering, and content to help millions of users find their next favorite show.\n\nRequirements:\n- 3+ years product management experience\n- Experience with recommendation systems or personalization\n- Strong analytical skills and data-driven decision making\n- Excellent communication and stakeholder management\n- Experience working with cross-functional teams\n\nCompensation: $180K-$250K + equity",
        "jd_source": "paste",
        "resume_text": "Alex Johnson\n\nAssociate Product Manager at Spotify (2022-2024)\n- Owned the 'Discover Weekly' playlist feature, increasing engagement by 15%\n- Led A/B testing framework improvements, reducing experiment cycle time by 40%\n- Collaborated with ML team to improve recommendation algorithm accuracy by 8%\n- Managed product roadmap for personalized content features\n\nProduct Management Intern at Amazon (2021)\n- Conducted user research that informed Prime Video's offline viewing feature\n- Analyzed customer behavior data to identify $2M revenue opportunity\n\nEducation:\n- MBA, Harvard Business School (2022)\n- BS Economics, Wharton School (2019)\n\nSkills: SQL, Python, A/B testing, user research, stakeholder management, Agile",
        "resume_source": "paste",
        "status": "completed",
        "overall_score": 78.2,
        "section_scores": json.dumps({
            "skills_match": 75,
            "experience_match": 82,
            "education_match": 85,
            "keyword_coverage": 70,
        }),
        "gap_analysis": json.dumps([
            {"skill": "3+ years PM experience (has 2+)", "severity": "medium", "impact": 8},
            {"skill": "Content/media industry experience", "severity": "medium", "impact": 6},
            {"skill": "Stakeholder management at scale", "severity": "low", "impact": 3},
        ]),
        "rewrite_suggestions": json.dumps([
            {
                "original": "Owned the 'Discover Weekly' playlist feature",
                "rewritten": "Owned the 'Discover Weekly' playlist feature, managing cross-functional stakeholder alignment across data science, engineering, and content teams to drive 15% engagement increase",
                "gap_addressed": "Stakeholder management",
            },
        ]),
        "cover_letter": json.dumps({
            "job_title": "Product Manager",
            "tone": "enthusiastic",
            "body": "Dear Netflix Hiring Team,\n\nI've been a passionate Netflix user for years, and I'm thrilled to apply for the Product Manager role on the content discovery team. My experience at Spotify building recommendation features has given me deep expertise in the exact intersection of data science and user experience that this role requires.\n\nAt Spotify, I owned the Discover Weekly feature and increased engagement by 15% through data-driven iteration. I'm excited about bringing this experience to Netflix's content discovery challenges.\n\nBest,\nAlex Johnson",
        }),
        "action_list": json.dumps([
            {"action": "Gain additional PM experience before reapplying", "priority": "high", "impact": 8},
            {"action": "Highlight media/entertainment industry exposure", "priority": "medium", "impact": 6},
        ]),
    },
    {
        "jd_text": "Junior Frontend Developer at Startup Co\n\nLooking for a junior developer to join our small but mighty team!\n\nRequirements:\n- 1-2 years experience with React\n- Basic understanding of HTML, CSS, JavaScript\n- Eagerness to learn and grow\n- Good communication skills\n\nNice to have:\n- Experience with TypeScript\n- Familiarity with design tools (Figma)\n- Understanding of accessibility standards",
        "jd_source": "url",
        "resume_text": "Sam Lee\n\nWeb Development Bootcamp Graduate (2024)\n- Completed 500+ hours of full-stack development training\n- Built 5 React projects including an e-commerce site and task manager\n- Learned HTML, CSS, JavaScript, React, Node.js, PostgreSQL\n\nFreelance Web Developer (2024)\n- Built responsive websites for 3 local businesses\n- Implemented contact forms and booking systems\n- Used Figma for design collaboration\n\nEducation:\n- BS Business Administration, UCLA (2022)\n\nSkills: HTML, CSS, JavaScript, React, Node.js, PostgreSQL, Figma",
        "resume_source": "paste",
        "status": "completed",
        "overall_score": 62.0,
        "section_scores": json.dumps({
            "skills_match": 68,
            "experience_match": 45,
            "education_match": 70,
            "keyword_coverage": 65,
        }),
        "gap_analysis": json.dumps([
            {"skill": "Professional work experience", "severity": "high", "impact": 15},
            {"skill": "TypeScript experience", "severity": "medium", "impact": 5},
            {"skill": "Accessibility standards knowledge", "severity": "low", "impact": 3},
        ]),
        "rewrite_suggestions": json.dumps([
            {
                "original": "Completed 500+ hours of full-stack development training",
                "rewritten": "Completed 500+ hours of intensive full-stack development training, building 5 production-ready React applications with TypeScript, responsive CSS, and accessibility-first design",
                "gap_addressed": "TypeScript and accessibility",
            },
        ]),
        "cover_letter": json.dumps({
            "job_title": "Junior Frontend Developer",
            "tone": "enthusiastic",
            "body": "Dear Startup Co Team,\n\nI'm excited to apply for the Junior Frontend Developer position. While I'm early in my career, I've dedicated myself to learning React and modern web development through my bootcamp and freelance work.\n\nMy 5 React projects demonstrate my ability to build real applications, and my freelance work has taught me how to collaborate with clients and deliver working solutions.\n\nI'm eager to learn from experienced developers and grow into a strong contributor.\n\nBest,\nSam Lee",
        }),
        "action_list": json.dumps([
            {"action": "Add TypeScript to skill set through personal projects", "priority": "high", "impact": 5},
            {"action": "Build more complex projects to demonstrate experience depth", "priority": "high", "impact": 15},
            {"action": "Study WCAG accessibility standards", "priority": "medium", "impact": 3},
        ]),
    },
]


async def seed():
    await init_db()
    print(f"Database initialized at {DB_PATH}")

    now = datetime.now(UTC)
    for i, run_data in enumerate(SAMPLE_RUNS):
        status = run_data.pop("status")
        created_at = now - timedelta(days=len(SAMPLE_RUNS) - i)

        run_id = await save_run(
            jd_text=run_data["jd_text"],
            jd_source=run_data["jd_source"],
            resume_text=run_data["resume_text"],
            resume_source=run_data["resume_source"],
            status="pending",
        )

        update_data = {k: v for k, v in run_data.items() if k not in ("jd_text", "jd_source", "resume_text", "resume_source")}
        update_data["status"] = status
        await update_run(run_id, **update_data)
        print(f"  Created run {run_id}: {run_data['jd_text'][:50]}...")

    print(f"\nSeeded {len(SAMPLE_RUNS)} demo runs")


if __name__ == "__main__":
    asyncio.run(seed())
