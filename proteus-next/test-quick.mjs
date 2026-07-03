require('dotenv/config');
const { readFileSync } = require('fs');
const { join } = require('path');

const BASE = "http://localhost:3000";

const JD_TEXT = `Amazon — Senior Software Engineer, Alexa AI

Location: Seattle, WA (On-site)
Team: Alexa AI, Natural Language Understanding

Requirements:
- 5+ years of software development experience
- Strong proficiency in Python and Java
- Experience with NLP/ML systems (transformers, BERT, LLMs)
- Experience with large-scale distributed systems
- Proficiency with AWS services (S3, EC2, Lambda, SageMaker)
- Experience with containerization (Docker, Kubernetes)
- Strong understanding of data structures and algorithms
- Experience with CI/CD pipelines and automated testing

Nice to Have:
- Experience with speech recognition or synthesis systems
- Knowledge of conversational AI and dialogue management

Qualifications:
- BS/MS in Computer Science or related field`;

async function main() {
  // Test 1: Text-only (fast)
  console.log("\n=== TEST 1: Text-only ===");
  const fd1 = new FormData();
  fd1.append("jd_text", JD_TEXT);
  fd1.append("resume_text", "John Doe, Senior Software Engineer\nPython, Java, AWS, Docker, Kubernetes, NLP, ML");

  const t1 = Date.now();
  const r1 = await fetch(`${BASE}/api/analyze`, { method: "POST", body: fd1 });
  const raw1 = await r1.text();
  const e1 = ((Date.now() - t1) / 1000).toFixed(1);
  console.log(`Status: ${r1.status} | Time: ${e1}s | Length: ${raw1.length}`);
  if (raw1.length < 3000) console.log(raw1);
  else console.log(raw1.substring(0, 2000));

  // Test 2: File upload
  console.log("\n=== TEST 2: File upload ===");
  const resumePath = join(process.cwd(), "..", "resume.pdf");
  const buf = readFileSync(resumePath);
  console.log(`Resume: ${buf.length} bytes`);

  const fd2 = new FormData();
  fd2.append("jd_text", JD_TEXT);
  fd2.append("resume_file", new Blob([buf], { type: "application/pdf" }), "resume.pdf");

  const t2 = Date.now();
  const r2 = await fetch(`${BASE}/api/analyze`, { method: "POST", body: fd2 });
  const raw2 = await r2.text();
  const e2 = ((Date.now() - t2) / 1000).toFixed(1);
  console.log(`Status: ${r2.status} | Time: ${e2}s | Length: ${raw2.length}`);
  if (raw2.length < 3000) console.log(raw2);
  else console.log(raw2.substring(0, 2000));

  // Test 3: History
  console.log("\n=== TEST 3: History ===");
  const r3 = await fetch(`${BASE}/api/history?limit=5`);
  const hist = await r3.json();
  console.log(`Count: ${hist.count}`);
  for (const run of hist.runs?.slice(0, 5) || []) {
    console.log(`  [${run.id}] score=${run.overall_score} status=${run.status}`);
  }

  console.log("\n=== DONE ===");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
