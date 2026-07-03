#!/usr/bin/env node
// proteus-next/scripts/model-health.mjs
// Self-healing model health check:
// 1. Tests each model in models.json
// 2. If dead → queries build.nvidia.com for available replacements
// 3. Tests each alternative → finds first working one
// 4. Replaces across ALL files (models.json, README.md, PROGRESS.md, etc.)
// 5. Outputs report for GitHub Actions

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const NEXT_ROOT = join(PROJECT_ROOT, "proteus-next");
const CONFIG_PATH = join(NEXT_ROOT, "models.json");
const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const TIMEOUT_MS = 30_000;
const EMBED_TIMEOUT_MS = 15_000;

const API_KEY = process.env.NVIDIA_NIM_API_KEY;
if (!API_KEY) {
  console.error("FATAL: NVIDIA_NIM_API_KEY not set");
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────

function loadConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

// ── NIM API ───────────────────────────────────────────────

async function fetchNimModels() {
  try {
    const res = await fetch(`${NIM_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function testChatModel(model, prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 30, temperature: 0.1 }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${text.substring(0, 100)}` };
    }
    const data = await res.json();
    return { ok: true, content: data.choices?.[0]?.message?.content?.substring(0, 100) || "" };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: e.name === "AbortError" ? `Timeout ${TIMEOUT_MS}ms` : e.message };
  }
}

async function testEmbedModel(model, text) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);
  try {
    const res = await fetch(`${NIM_BASE_URL}/embeddings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: text, input_type: "query" }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, dims: data.data?.[0]?.embedding?.length || 0 };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: e.name === "AbortError" ? `Timeout ${EMBED_TIMEOUT_MS}ms` : e.message };
  }
}

// ── Model Discovery ───────────────────────────────────────

function categorizeModel(modelId) {
  const id = modelId.toLowerCase();
  if (id.includes("embed")) return "embedding";
  if (id.includes("guard") || id.includes("safety")) return "safety";
  if (id.includes("vision") || id.includes("vl-")) return "vision";
  if (id.includes("code")) return "code";
  return "chat";
}

async function findReplacement(deadModel, roleConfig, allNimModels, preferredPrefixes) {
  const isEmbed = roleConfig.type === "embedding";
  const targetCategory = isEmbed ? "embedding" : "chat";

  // Get available models from NIM catalog, filtered by category
  const candidates = allNimModels
    .map((m) => m.id)
    .filter((id) => {
      const cat = categorizeModel(id);
      return cat === targetCategory && id !== deadModel;
    });

  // Sort by preference: preferred prefixes first, then alphabetically
  candidates.sort((a, b) => {
    const aIdx = preferredPrefixes.findIndex((p) => a.startsWith(p));
    const bIdx = preferredPrefixes.findIndex((p) => b.startsWith(p));
    const aScore = aIdx >= 0 ? aIdx : preferredPrefixes.length;
    const bScore = bIdx >= 0 ? bIdx : preferredPrefixes.length;
    return aScore - bScore || a.localeCompare(b);
  });

  console.log(`  Found ${candidates.length} candidate ${targetCategory} models from NIM catalog`);
  console.log(`  Top candidates: ${candidates.slice(0, 5).join(", ")}`);

  // Test each candidate until we find a working one
  for (const candidate of candidates) {
    const start = Date.now();
    const result = isEmbed
      ? await testEmbedModel(candidate, "test replacement")
      : await testChatModel(candidate, "Return exactly: {\"ok\":true}");
    const latency = Date.now() - start;

    if (result.ok) {
      console.log(`  ✓ Found working replacement: ${candidate} (${latency}ms)`);
      return { model: candidate, latency };
    } else {
      console.log(`  ✗ ${candidate}: ${result.error}`);
    }
  }

  console.log(`  WARNING: No healthy replacement found for ${deadModel}`);
  return null;
}

// ── Global Find & Replace ─────────────────────────────────

function findFilesWithModel(oldModel) {
  const files = [];
  const searchDirs = [NEXT_ROOT, PROJECT_ROOT];
  const extensions = [".json", ".md", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".yml", ".yaml", ".txt"];

  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir); } catch { return; }
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath, { throwOnError: false });
      if (!stat) continue;
      if (stat.isDirectory()) {
        if (entry === "node_modules" || entry === ".next" || entry === ".git" || entry === "dist") continue;
        walk(fullPath);
      } else if (extensions.includes(extname(entry).toLowerCase())) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          if (content.includes(oldModel)) {
            files.push(fullPath);
          }
        } catch {}
      }
    }
  }

  for (const dir of searchDirs) walk(dir);
  return files;
}

function replaceInFiles(oldModel, newModel) {
  const files = findFilesWithModel(oldModel);
  const changes = [];

  for (const file of files) {
    try {
      let content = readFileSync(file, "utf-8");
      const count = (content.match(new RegExp(oldModel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
      content = content.split(oldModel).join(newModel);
      writeFileSync(file, content, "utf-8");
      changes.push({ file: file.replace(PROJECT_ROOT, "."), occurrences: count });
    } catch (e) {
      console.error(`  Failed to update ${file}: ${e.message}`);
    }
  }

  return changes;
}

// ── README Auto-Update ────────────────────────────────────

function updateReadmeModels(config) {
  const readmePath = join(PROJECT_ROOT, "README.md");
  let readme;
  try { readme = readFileSync(readmePath, "utf-8"); } catch { return; }

  const startMarker = "<!-- MODELS AUTO-GENERATED START -->";
  const endMarker = "<!-- END MODELS AUTO-GENERATED -->";
  const startIdx = readme.indexOf(startMarker);
  const endIdx = readme.indexOf(endMarker);
  if (startIdx < 0 || endIdx < 0) return;

  const lines = ["### Active Models (auto-updated by health check bot)\n"];
  lines.push("| Role | Model | Last Checked |");
  lines.push("|------|-------|--------------|");
  for (const [role, model] of Object.entries(config.lastHealthyModels || {})) {
    lines.push(`| ${role} | \`${model}\` | ${config.lastHealthCheck || "never"} |`);
  }
  lines.push("");

  const table = lines.join("\n");
  const before = readme.substring(0, startIdx + startMarker.length);
  const after = readme.substring(endIdx);
  writeFileSync(readmePath, before + "\n" + table + after, "utf-8");
  console.log("  README.md models table updated.");
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const config = loadConfig();
  const report = [];
  const healthyModels = {};
  let changed = false;

  console.log("=== PROTEUS SELF-HEALING MODEL HEALTH CHECK ===\n");

  // 1. Fetch available models from NIM catalog
  console.log("Fetching available models from NVIDIA NIM catalog...");
  const allNimModels = await fetchNimModels();
  console.log(`  ${allNimModels.length} models available on build.nvidia.com\n`);

  // 2. Test each role's current model
  for (const [roleName, roleConfig] of Object.entries(config.roles)) {
    const isEmbed = roleConfig.type === "embedding";
    const testPrompt = roleConfig.testPrompt || "Say hi";

    console.log(`Role: ${roleName} (${roleConfig.description})`);
    console.log(`  Current: ${roleConfig.current}`);

    const start = Date.now();
    const result = isEmbed
      ? await testEmbedModel(roleConfig.current, testPrompt)
      : await testChatModel(roleConfig.current, testPrompt);
    const latency = Date.now() - start;

    if (result.ok) {
      console.log(`  Status: HEALTHY (${latency}ms)\n`);
      healthyModels[roleName] = roleConfig.current;
      report.push({ role: roleName, model: roleConfig.current, status: "healthy", latency });
      continue;
    }

    console.log(`  Status: UNHEALTHY - ${result.error}`);

    // 3. Model is dead → find replacement from NIM catalog
    const replacement = await findReplacement(roleConfig.current, roleConfig, allNimModels, config.preferredPrefixes || []);

    if (replacement) {
      const oldModel = roleConfig.current;
      const newModel = replacement.model;

      // 4. Replace across ALL files
      console.log(`\n  Replacing ${oldModel} → ${newModel} across all files...`);
      const fileChanges = replaceInFiles(oldModel, newModel);

      config.roles[roleName].current = newModel;
      changed = true;
      healthyModels[roleName] = newModel;
      report.push({
        role: roleName,
        model: newModel,
        replacedFrom: oldModel,
        status: "replaced",
        latency: replacement.latency,
        fileChanges,
      });

      for (const fc of fileChanges) {
        console.log(`    ${fc.file} (${fc.occurrences} occurrences)`);
      }
    } else {
      healthyModels[roleName] = roleConfig.current;
      report.push({ role: roleName, model: roleConfig.current, status: "no_healthy_model", latency });
    }
    console.log();
  }

  // 5. Save config
  config.lastHealthCheck = new Date().toISOString();
  config.lastHealthyModels = healthyModels;
  saveConfig(config);

  // 6. Update README models table
  updateReadmeModels(config);

  // 6. Summary
  console.log("=== SUMMARY ===");
  for (const r of report) {
    const icon = r.status === "healthy" ? "OK" : r.status === "replaced" ? "REPLACED" : "FAIL";
    const extra = r.replacedFrom ? ` (was: ${r.replacedFrom})` : "";
    console.log(`  [${icon}] ${r.role}: ${r.model}${extra} (${r.latency}ms)`);
    if (r.fileChanges) {
      for (const fc of r.fileChanges) {
        console.log(`         → ${fc.file} (${fc.occurrences} replacements)`);
      }
    }
  }

  console.log(`\nChanged: ${changed}`);

  // 7. GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    const changes = report.filter((r) => r.status === "replaced");
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `changes_json=${JSON.stringify(changes)}\n`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
