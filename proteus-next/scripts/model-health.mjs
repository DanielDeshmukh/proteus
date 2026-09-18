#!/usr/bin/env node
// proteus-next/scripts/model-health.mjs
// Groq-only model health check:
// 1. Tests each role's current model
// 2. If unhealthy → tests fallback
// 3. If fallback works → swaps
// 4. If both dead → queries Groq catalog for replacement

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, "..", "models.json");
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const TIMEOUT_MS = 30_000;

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
if (!GROQ_API_KEY) {
  console.error("FATAL: GROQ_API_KEY not set");
  process.exit(1);
}

function loadConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

async function testGroqChatModel(model, prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 30, temperature: 0.1 }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${text.substring(0, 100)}` };
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    if (!content) return { ok: false, error: "Empty response" };
    return { ok: true, content: content.substring(0, 200) };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: e.name === "AbortError" ? `Timeout ${TIMEOUT_MS}ms` : e.message };
  }
}

async function fetchGroqModels() {
  try {
    const res = await fetch(`${GROQ_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).filter(m =>
      m.active && m.id &&
      !m.id.includes("guard") && !m.id.includes("whisper") &&
      !m.id.includes("compound") && !m.id.includes("allam") &&
      !m.id.includes("tts") && !m.id.includes("speech")
    );
  } catch {
    return [];
  }
}

async function findReplacement(deadModel, roleConfig, allGroqModels) {
  const candidates = allGroqModels
    .map(m => m.id)
    .filter(id => id !== deadModel && !id.includes("guard") && !id.includes("whisper"));

  console.log(`  Found ${candidates.length} candidate models from Groq catalog`);
  console.log(`  Top candidates: ${candidates.slice(0, 5).join(", ")}`);

  for (const candidate of candidates) {
    const start = Date.now();
    const result = await testGroqChatModel(candidate, 'Return exactly: {"ok":true}');
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

async function main() {
  const config = loadConfig();
  const report = [];
  const healthyModels = {};
  let changed = false;

  console.log("=== PROTEUS MODEL HEALTH CHECK (Groq-only) ===\n");

  console.log("Fetching available models from Groq...");
  const allGroqModels = await fetchGroqModels();
  console.log(`  ${allGroqModels.length} models available on Groq\n`);

  for (const [roleName, roleConfig] of Object.entries(config.roles)) {
    const isEmbed = roleConfig.type === "embedding";
    const testPrompt = roleConfig.testPrompt || "Say hi";

    console.log(`Role: ${roleName} (${roleConfig.description})`);
    console.log(`  Current: ${roleConfig.current}`);
    console.log(`  Fallback: ${roleConfig.fallbacks?.[0] || "none"}`);

    const start = Date.now();
    const result = await testGroqChatModel(roleConfig.current, testPrompt);
    const latency = Date.now() - start;

    if (result.ok) {
      try {
        let jsonStr = result.content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        const firstBrace = jsonStr.indexOf("{");
        if (firstBrace >= 0) jsonStr = jsonStr.substring(firstBrace);
        const lastBrace = jsonStr.lastIndexOf("}");
        if (lastBrace >= 0) jsonStr = jsonStr.substring(0, lastBrace + 1);
        JSON.parse(jsonStr);
      } catch {
        result.ok = false;
      }
    }

    if (result.ok) {
      console.log(`  Status: HEALTHY (${latency}ms)\n`);
      healthyModels[roleName] = roleConfig.current;
      report.push({ role: roleName, model: roleConfig.current, status: "healthy", latency });
      continue;
    }

    console.log(`  Status: UNHEALTHY - ${result.error}`);

    const fallbackModel = roleConfig.fallbacks?.[0];
    if (fallbackModel) {
      console.log(`  Testing fallback: ${fallbackModel}`);
      const fbStart = Date.now();
      const fbResult = await testGroqChatModel(fallbackModel, testPrompt);
      const fbLatency = Date.now() - fbStart;

      if (fbResult.ok) {
        console.log(`  ✓ Fallback healthy — swapping (${fbLatency}ms)\n`);
        const oldCurrent = roleConfig.current;
        config.roles[roleName].current = fallbackModel;
        config.roles[roleName].fallbacks = [
          oldCurrent,
          ...roleConfig.fallbacks.filter(m => m !== fallbackModel),
        ];
        changed = true;
        healthyModels[roleName] = fallbackModel;
        report.push({ role: roleName, model: fallbackModel, replacedFrom: oldCurrent, status: "swapped_to_fallback", latency: fbLatency });
        continue;
      }
      console.log(`  ✗ Fallback also unhealthy: ${fbResult.error}`);
    }

    console.log(`  Searching Groq catalog for replacement...`);
    const replacement = await findReplacement(roleConfig.current, roleConfig, allGroqModels);

    if (replacement) {
      const oldModel = roleConfig.current;
      config.roles[roleName].current = replacement.model;
      config.roles[roleName].fallbacks = [oldModel, ...roleConfig.fallbacks.filter(m => m !== replacement.model)];
      changed = true;
      healthyModels[roleName] = replacement.model;
      report.push({ role: roleName, model: replacement.model, replacedFrom: oldModel, status: "replaced", latency: replacement.latency });
    } else {
      healthyModels[roleName] = roleConfig.current;
      report.push({ role: roleName, model: roleConfig.current, status: "no_healthy_model", latency });
    }
    console.log();
  }

  config.lastHealthCheck = new Date().toISOString();
  config.lastHealthyModels = healthyModels;
  saveConfig(config);

  console.log("=== SUMMARY ===");
  for (const r of report) {
    const icon = r.status === "healthy" ? "OK" : r.status === "replaced" ? "REPLACED" : r.status === "swapped_to_fallback" ? "SWAPPED" : "FAIL";
    const extra = r.replacedFrom ? ` (was: ${r.replacedFrom})` : "";
    console.log(`  [${icon}] ${r.role}: ${r.model}${extra} (${r.latency}ms)`);
  }

  console.log(`\nChanged: ${changed}`);

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    const changes = report.filter(r => r.status === "replaced" || r.status === "swapped_to_fallback");
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `changes_json=${JSON.stringify(changes)}\n`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
