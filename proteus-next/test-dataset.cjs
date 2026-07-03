const { readFileSync, writeFileSync, appendFileSync, existsSync } = require("fs");
const { join } = require("path");

const BASE = "http://localhost:3000";
const DATASET_PATH = "C:\\Users\\DANIEL\\.cache\\kagglehub\\datasets\\adityarajsrv\\job-descriptions-2025-tech-and-non-tech-roles\\versions\\1\\job_dataset.csv";
const RESUME_PATH = join(process.cwd(), "..", "resume.pdf");
const RESULTS_FILE = join(process.cwd(), "dataset-results.jsonl");
const LOG_FILE = join(process.cwd(), "dataset-results.log");

// Parse command line args
const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1]) : Infinity;
const RESUME_ONLY = args.includes("--resume-text");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

async function parseCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    const fs = require("fs");
    const content = fs.readFileSync(DATASET_PATH, "utf-8");
    const lines = content.split("\n");
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      // Simple CSV parse (handles quoted fields with semicolons)
      const match = lines[i].match(/^(".*?"|[^",]+)(,(".*?"|[^",]+))*(,|$)/);
      if (!match) continue;
      
      // Use a proper parser for the fields
      const row = {};
      let current = "";
      let fieldIdx = 0;
      let inQuotes = false;
      
      for (let c = 0; c < lines[i].length; c++) {
        const ch = lines[i][c];
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === "," && !inQuotes) {
          row[headers[fieldIdx]] = current.trim();
          current = "";
          fieldIdx++;
        } else {
          current += ch;
        }
      }
      row[headers[fieldIdx]] = current.trim();
      
      // Build a full JD text from the structured fields
      const jdText = buildJDText(row);
      if (jdText.length > 50) {
        results.push({ ...row, jdText });
      }
    }
    resolve(results);
  });
}

function buildJDText(row) {
  const parts = [];
  if (row.Title) parts.push(row.Title);
  if (row.ExperienceLevel) parts.push(`Experience Level: ${row.ExperienceLevel}`);
  if (row.YearsOfExperience) parts.push(`Years of Experience: ${row.YearsOfExperience}`);
  if (row.Skills) parts.push(`Skills:\n${row.Skills.split(";").map(s => `- ${s.trim()}`).join("\n")}`);
  if (row.Responsibilities) parts.push(`Responsibilities:\n${row.Responsibilities.split(";").map(s => `- ${s.trim()}`).join("\n")}`);
  if (row.Keywords) parts.push(`Keywords: ${row.Keywords}`);
  return parts.join("\n\n");
}

async function testJD(jd, index, resumeText, retryCount = 0) {
  const fd = new FormData();
  fd.append("jd_text", jd.jdText);
  fd.append("resume_text", resumeText);

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 600000); // 10 min timeout
    const res = await fetch(`${BASE}/api/analyze`, { method: "POST", body: fd, signal: controller.signal });
    clearTimeout(timer);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    
    if (!res.ok) {
      const err = await res.text().catch(() => "");
      if (retryCount < 2 && (res.status === 500 || res.status === 504)) {
        log(`  Retry ${retryCount + 1}/2 after HTTP ${res.status}...`);
        await new Promise(r => setTimeout(r, 5000));
        return testJD(jd, index, resumeText, retryCount + 1);
      }
      return { index, jobId: jd.JobID, title: jd.Title, level: jd.ExperienceLevel, status: "error", httpStatus: res.status, error: err.substring(0, 200), time: elapsed };
    }

    const data = await res.json();
    return {
      index,
      jobId: jd.JobID,
      title: jd.Title,
      level: jd.ExperienceLevel,
      status: data.errors?.length ? "partial" : "ok",
      score: data.overall_score,
      sectionScores: data.section_scores,
      gaps: data.gap_analysis ? { matched: data.gap_analysis.matched_count, partial: data.gap_analysis.partial_count, missing: data.gap_analysis.missing_count, total: data.gap_analysis.total_requirements } : null,
      rewriteCount: data.rewrite_suggestions?.suggestions?.length ?? 0,
      coverLetterWords: data.cover_letter?.word_count ?? 0,
      actionCount: data.action_list?.length ?? 0,
      time: elapsed,
      errors: data.errors,
    };
  } catch (e) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const isAbort = e.name === "AbortError";
    if (retryCount < 2) {
      log(`  Retry ${retryCount + 1}/2 after ${isAbort ? "timeout" : e.message}...`);
      await new Promise(r => setTimeout(r, 5000));
      return testJD(jd, index, resumeText, retryCount + 1);
    }
    return { index, jobId: jd.JobID, title: jd.Title, level: jd.ExperienceLevel, status: "failed", error: isAbort ? "Timeout after 10min" : e.message, time: elapsed };
  }
}

function printResult(r) {
  const icon = r.status === "ok" ? "OK" : r.status === "partial" ? "PART" : "FAIL";
  const score = r.score != null ? `${(r.score * 100).toFixed(0)}%` : "N/A";
  const gaps = r.gaps ? `M${r.gaps.matched}/P${r.gaps.partial}/X${r.gaps.missing}` : "";
  log(`[${icon}] #${r.index} ${r.jobId} | ${r.title} (${r.level}) | Score: ${score} | ${gaps} | Rewrites: ${r.rewriteCount} | Cover: ${r.coverLetterWords}w | ${r.time}s`);
  if (r.errors) log(`  Errors: ${r.errors.join(", ")}`);
}

async function main() {
  log("=== PROTEUS DATASET TEST ===");
  
  // Load resume
  let resumeText;
  if (RESUME_ONLY) {
    resumeText = readFileSync(join(process.cwd(), "..", "resume.pdf"));
    log("Resume: PDF binary (file upload)");
  } else {
    // Use text version for speed
    resumeText = `Daniel Shashank Deshmukh
Full-Stack Developer · AI Systems Builder · SaaS Architect
+91 8552084251 · deshmukhdaniel2005@gmail.com · github.com/DanielDeshmukh · Mumbai, India

SUMMARY
Full-stack developer with expertise in AI systems, SaaS architecture, and end-to-end product development. Built and deployed production AI pipelines, real-time analytics platforms, and scalable web applications.

EXPERIENCE

AI Systems Builder — Independent (2023-Present)
- Built PROTEUS: AI-powered job application toolkit with 5-agent NVIDIA NIM pipeline
- Designed semantic match scoring using embedding-based cosine similarity
- Implemented real-time streaming API with NDJSON for pipeline progress
- Built automated model health monitoring with self-healing NIM integration

Full-Stack Developer — Various Projects (2022-Present)
- Developed SaaS platforms with Next.js, TypeScript, and Tailwind CSS
- Built real-time data pipelines processing thousands of events per second
- Implemented CI/CD pipelines with automated testing and deployment
- Designed responsive, accessible UIs with dark theme design systems

EDUCATION
B.Tech Computer Science — Mumbai University

SKILLS
TypeScript, JavaScript, Python, React, Next.js, Node.js, Tailwind CSS, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, NVIDIA NIM, OpenAI API, LLMs, RAG, Semantic Search, Git, CI/CD, SaaS Architecture`;
    log("Resume: text (paste mode)");
  }

  // Load JDs
  const jds = await parseCSV();
  const toTest = jds.slice(0, LIMIT);
  log(`Dataset: ${jds.length} JDs total, testing ${toTest.length}`);
  
  // Check existing results
  let startIdx = 0;
  if (existsSync(RESULTS_FILE)) {
    const existing = readFileSync(RESULTS_FILE, "utf-8").trim().split("\n").filter(Boolean);
    startIdx = existing.length;
    log(`Resuming from index ${startIdx} (${existing.length} already done)`);
  }

  const results = [];
  let ok = 0, partial = 0, fail = 0;

  for (let i = startIdx; i < toTest.length; i++) {
    const jd = toTest[i];
    log(`\n--- [${i + 1}/${toTest.length}] ${jd.JobID}: ${jd.Title} (${jd.ExperienceLevel}) ---`);
    
    const result = await testJD(jd, i, resumeText);
    results.push(result);
    printResult(result);

    // Append to JSONL file
    appendFileSync(RESULTS_FILE, JSON.stringify(result) + "\n");

    if (result.status === "ok") ok++;
    else if (result.status === "partial") partial++;
    else fail++;

    // Progress update every 10
    if ((i + 1) % 10 === 0) {
      log(`\n--- PROGRESS: ${i + 1}/${toTest.length} | OK: ${ok} | Partial: ${partial} | Failed: ${fail} ---`);
    }
  }

  // Final summary
  log("\n=== FINAL SUMMARY ===");
  log(`Total: ${toTest.length} | OK: ${ok} | Partial: ${partial} | Failed: ${fail}`);
  
  // Score distribution
  const scores = results.filter(r => r.score != null).map(r => r.score);
  if (scores.length > 0) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    log(`Score: avg=${(avg * 100).toFixed(1)}% min=${(min * 100).toFixed(1)}% max=${(max * 100).toFixed(1)}%`);
  }

  // Level breakdown
  const byLevel = {};
  for (const r of results) {
    const level = r.level || "Unknown";
    if (!byLevel[level]) byLevel[level] = { count: 0, scores: [] };
    byLevel[level].count++;
    if (r.score != null) byLevel[level].scores.push(r.score);
  }
  log("\nBy Level:");
  for (const [level, data] of Object.entries(byLevel).sort((a, b) => b[1].count - a[1].count)) {
    const avg = data.scores.length ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 100).toFixed(1) : "N/A";
    log(`  ${level}: ${data.count} JDs, avg score: ${avg}%`);
  }

  log("\n=== DONE ===");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
