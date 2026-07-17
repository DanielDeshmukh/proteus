#!/usr/bin/env node
// proteus-next/scripts/model-health.mjs
// Self-healing model health check (v2):
// 1. Tests each role's current model in models.json
// 2. If unhealthy → tests that role's fallback model
// 3. If fallback works → swaps current ↔ fallback
// 4. If fallback also dead → queries NIM catalog for a working replacement
// 5. Updates ONLY models.json (role-scoped, no global find-and-replace)

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
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

  const candidates = allNimModels
    .map((m) => m.id)
    .filter((id) => {
      const cat = categorizeModel(id);
      return cat === targetCategory && id !== deadModel;
    });

  candidates.sort((a, b) => {
    const aIdx = preferredPrefixes.findIndex((p) => a.startsWith(p));
    const bIdx = preferredPrefixes.findIndex((p) => b.startsWith(p));
    const aScore = aIdx >= 0 ? aIdx : preferredPrefixes.length;
    const bScore = bIdx >= 0 ? bIdx : preferredPrefixes.length;
    return aScore - bScore || a.localeCompare(b);
  });

  console.log(`  Found ${candidates.length} candidate ${targetCategory} models from NIM catalog`);
  console.log(`  Top candidates: ${candidates.slice(0, 5).join(", ")}`);

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

// ── Main ──────────────────────────────────────────────────

async function main() {
  const config = loadConfig();
  const report = [];
  const healthyModels = {};
  let changed = false;

  console.log("=== PROTEUS MODEL HEALTH CHECK (v2 — role-scoped) ===\n");

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
    console.log(`  Fallback: ${roleConfig.fallbacks?.[0] || "none"}`);

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

    // 3. Try fallback model first
    const fallbackModel = roleConfig.fallbacks?.[0];
    if (fallbackModel) {
      console.log(`  Testing fallback: ${fallbackModel}`);
      const fbStart = Date.now();
      const fbResult = isEmbed
        ? await testEmbedModel(fallbackModel, testPrompt)
        : await testChatModel(fallbackModel, testPrompt);
      const fbLatency = Date.now() - fbStart;

      if (fbResult.ok) {
        console.log(`  ✓ Fallback healthy — swapping current ↔ fallback (${fbLatency}ms)\n`);

        // Swap: fallback becomes current, old current goes to front of fallbacks
        const oldCurrent = roleConfig.current;
        config.roles[roleName].current = fallbackModel;
        config.roles[roleName].fallbacks = [
          oldCurrent,
          ...roleConfig.fallbacks.filter((m) => m !== fallbackModel),
        ];
        changed = true;
        healthyModels[roleName] = fallbackModel;
        report.push({
          role: roleName,
          model: fallbackModel,
          replacedFrom: oldCurrent,
          status: "swapped_to_fallback",
          latency: fbLatency,
        });
        continue;
      }
      console.log(`  ✗ Fallback also unhealthy: ${fbResult.error}`);
    }

    // 4. Both current and fallback dead → find replacement from NIM catalog
    console.log(`  Searching NIM catalog for replacement...`);
    const replacement = await findReplacement(roleConfig.current, roleConfig, allNimModels, config.preferredPrefixes || []);

    if (replacement) {
      const oldModel = roleConfig.current;
      const newModel = replacement.model;

      // Update ONLY this role in models.json
      config.roles[roleName].current = newModel;
      // Put old model + fallback at front of fallbacks
      config.roles[roleName].fallbacks = [
        oldModel,
        ...roleConfig.fallbacks.filter((m) => m !== newModel),
      ];
      changed = true;
      healthyModels[roleName] = newModel;
      report.push({
        role: roleName,
        model: newModel,
        replacedFrom: oldModel,
        status: "replaced",
        latency: replacement.latency,
      });
    } else {
      healthyModels[roleName] = roleConfig.current;
      report.push({ role: roleName, model: roleConfig.current, status: "no_healthy_model", latency });
    }
    console.log();
  }

  // 5. Save config (ONLY models.json is modified)
  config.lastHealthCheck = new Date().toISOString();
  config.lastHealthyModels = healthyModels;
  saveConfig(config);

  // 6. Summary
  console.log("=== SUMMARY ===");
  for (const r of report) {
    const icon = r.status === "healthy" ? "OK" : r.status === "replaced" ? "REPLACED" : r.status === "swapped_to_fallback" ? "SWAPPED" : "FAIL";
    const extra = r.replacedFrom ? ` (was: ${r.replacedFrom})` : "";
    console.log(`  [${icon}] ${r.role}: ${r.model}${extra} (${r.latency}ms)`);
  }

  console.log(`\nChanged: ${changed}`);

  // 7. GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    const changes = report.filter((r) => r.status === "replaced" || r.status === "swapped_to_fallback");
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `changes_json=${JSON.stringify(changes)}\n`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
