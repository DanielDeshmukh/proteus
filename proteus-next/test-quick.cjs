const { readFileSync } = require('fs');
const { join } = require('path');

const BASE = 'http://localhost:3000';

const JD = `Amazon — Senior Software Engineer, Alexa AI

Location: Seattle, WA (On-site)
Team: Alexa AI, Natural Language Understanding

About the Role:
Join Amazon's Alexa AI team to build the natural language understanding capabilities that power millions of Echo devices.

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
- Experience with real-time inference systems

Qualifications:
- BS/MS in Computer Science or related field`;

async function testAnalyze(label, fd) {
  console.log(`\n=== ${label} ===`);
  const t = Date.now();
  try {
    const r = await fetch(`${BASE}/api/analyze`, { method: 'POST', body: fd });
    const raw = await r.text();
    const e = ((Date.now() - t) / 1000).toFixed(1);
    console.log(`Status: ${r.status} | Time: ${e}s`);
    let data;
    try { data = JSON.parse(raw); } catch { console.log('RAW:', raw.substring(0, 500)); return; }
    console.log(`Run ID: ${data.run_id}`);
    console.log(`Score: ${data.overall_score}`);
    console.log(`Section Scores:`, data.section_scores);
    console.log(`Gaps: matched=${data.gap_analysis?.matched_count} partial=${data.gap_analysis?.partial_count} missing=${data.gap_analysis?.missing_count}`);
    console.log(`Rewrites: ${data.rewrite_suggestions?.suggestions?.length ?? 'null'}`);
    console.log(`Cover Letter: ${data.cover_letter?.word_count ?? 'null'} words`);
    console.log(`Actions: ${data.action_list?.length ?? 0}`);
    console.log(`Timings:`, data.timings);
    if (data.errors) console.log(`Errors:`, data.errors);
    return data;
  } catch (e) {
    console.error(`FAILED after $((Date.now() - t) / 1000)s:`, e.message);
  }
}

async function main() {
  // Test 1: File upload with resume.pdf
  const buf = readFileSync(join(process.cwd(), '..', 'resume.pdf'));
  console.log(`Resume PDF: ${buf.length} bytes`);

  const fd1 = new FormData();
  fd1.append('jd_text', JD);
  fd1.append('resume_file', new Blob([buf], { type: 'application/pdf' }), 'resume.pdf');
  await testAnalyze('File Upload (resume.pdf + JD)', fd1);

  // Test 2: History
  console.log('\n=== History ===');
  const hr = await fetch(`${BASE}/api/history?limit=5`);
  const hist = await hr.json();
  console.log(`Total runs: ${hist.count}`);
  for (const run of hist.runs?.slice(0, 5) || []) {
    console.log(`  [${run.id}] score=${run.overall_score} status=${run.status} created=${run.created_at}`);
  }

  console.log('\n=== DONE ===');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
