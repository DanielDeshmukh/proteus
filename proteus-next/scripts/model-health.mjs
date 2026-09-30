#!/usr/bin/env node
// proteus-next/scripts/model-health.mjs
// Role-scoped model health check:
// 1. Tests each role's current model with its own provider (Groq chat, Gemini chat, Gemini embedding)
// 2. If unhealthy → tries ONLY that role's own fallbacks + swap_pool (never a global catalog scan,
//    so one outage can no longer converge every role onto the same model)
// 3. Roles marked "pinned" are reported unhealthy but never auto-swapped
// 4. Embedding roles are tested via Gemini batchEmbedContents

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, "..", "models.json");
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_NATIVE_URL = "https://generativelanguage.googleapis.com/v1beta";
const TIMEOUT_MS = 30_000;

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GROQ_API_KEY || !GEMINI_API_KEY) {
  const missing = [!GROQ_API_KEY && "GROQ_API_KEY", !GEMINI_API_KEY && "GEMINI_API_KEY"].filter(Boolean);
  console.error(`FATAL: ${missing.join(" and ")} not set`);
  process.exit(1);
}

function loadConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

function providerFor(model, explicit) {
  if (explicit) return explicit;
  return model.startsWith("gemini") ? "gemini" : "groq";
}

function looksLikeJsonObject(content) {
  let jsonStr = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  const firstBrace = jsonStr.indexOf("{");
  if (firstBrace >= 0) jsonStr = jsonStr.substring(firstBrace);
  const lastBrace = jsonStr.lastIndexOf("}");
  if (lastBrace >= 0) jsonStr = jsonStr.substring(0, lastBrace + 1);
  try {
    JSON.parse(jsonStr);
    return true;
  } catch {
    return false;
  }
}

async function testChat(model, prompt, provider) {
  const baseUrl = provider === "gemini" ? GEMINI_BASE_URL : GROQ_BASE_URL;
  const apiKey = provider === "gemini" ? GEMINI_API_KEY : GROQ_API_KEY;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 1000, temperature: 0.1 }),
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
    if (!looksLikeJsonObject(content)) return { ok: false, error: "Non-JSON response" };
    return { ok: true };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: e.name === "AbortError" ? `Timeout ${TIMEOUT_MS}ms` : e.message };
  }
}

async function testEmbedding(model) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GEMINI_NATIVE_URL}/models/${model}:batchEmbedContents`, {
      method: "POST",
      headers: { "x-goog-api-key": GEMINI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{ model: `models/${model}`, content: { parts: [{ text: "PROTEUS model health check" }] } }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${text.substring(0, 100)}` };
    }
    const data = await res.json();
    const values = data.embeddings?.[0]?.values;
    if (!Array.isArray(values) || values.length === 0) return { ok: false, error: "Empty embedding vector" };
    return { ok: true };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: e.name === "AbortError" ? `Timeout ${TIMEOUT_MS}ms` : e.message };
  }
}

async function testRoleModel(model, roleConfig, provider) {
  if (roleConfig.type === "embedding") {
    if (provider !== "gemini") return { ok: false, error: "Embedding candidates must use gemini provider" };
    return testEmbedding(model);
  }
  return testChat(model, roleConfig.testPrompt || "Say hi", provider);
}

function buildCandidates(roleConfig) {
  const seen = new Set([roleConfig.current]);
  const candidates = [];
  for (const fb of roleConfig.fallbacks || []) {
    if (!seen.has(fb)) {
      seen.add(fb);
      candidates.push({ model: fb, provider: providerFor(fb) });
    }
  }
  for (const entry of roleConfig.swap_pool || []) {
    if (!seen.has(entry.model)) {
      seen.add(entry.model);
      candidates.push({ model: entry.model, provider: entry.provider || providerFor(entry.model) });
    }
  }
  return candidates;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const config = loadConfig();
  const report = [];
  const healthyModels = {};
  let changed = false;

  console.log("=== PROTEUS MODEL HEALTH CHECK (role-scoped) ===\n");

  for (const [roleName, roleConfig] of Object.entries(config.roles)) {
    const isEmbed = roleConfig.type === "embedding";
    const provider = providerFor(roleConfig.current, roleConfig.provider);
    const pinned = roleConfig.pinned === true;

    console.log(`Role: ${roleName} (${roleConfig.description})`);
    console.log(`  Current: ${roleConfig.current} [${provider}]${pinned ? " (pinned)" : ""}`);

    await sleep(1500);
    const start = Date.now();
    const result = await testRoleModel(roleConfig.current, roleConfig, provider);
    const latency = Date.now() - start;

    if (result.ok) {
      console.log(`  Status: HEALTHY (${latency}ms)\n`);
      healthyModels[roleName] = roleConfig.current;
      report.push({ role: roleName, model: roleConfig.current, status: "healthy", latency });
      continue;
    }

    console.log(`  Status: UNHEALTHY - ${result.error}`);

    if (pinned) {
      console.log(`  Role is pinned — reported, not auto-swapped\n`);
      healthyModels[roleName] = roleConfig.current;
      report.push({ role: roleName, model: roleConfig.current, status: "pinned_unhealthy", latency });
      continue;
    }

    const candidates = buildCandidates(roleConfig);
    console.log(`  Trying ${candidates.length} role-scoped candidate(s): ${candidates.map((c) => c.model).join(", ") || "none"}`);

    let swapped = false;
    for (const cand of candidates) {
      await sleep(1500);
      const candStart = Date.now();
      const candResult = await testRoleModel(cand.model, roleConfig, cand.provider);
      const candLatency = Date.now() - candStart;

      if (candResult.ok) {
        console.log(`  ✓ Swapped to ${cand.model} [${cand.provider}] (${candLatency}ms)\n`);
        const oldCurrent = roleConfig.current;
        config.roles[roleName].current = cand.model;
        config.roles[roleName].provider = cand.provider;
        config.roles[roleName].fallbacks = [
          oldCurrent,
          ...roleConfig.fallbacks.filter((m) => m !== cand.model),
        ];
        changed = true;
        healthyModels[roleName] = cand.model;
        report.push({ role: roleName, model: cand.model, replacedFrom: oldCurrent, status: "swapped", latency: candLatency });
        swapped = true;
        break;
      }
      console.log(`  ✗ ${cand.model}: ${candResult.error}`);
    }

    if (!swapped) {
      console.log(`  WARNING: no healthy model found for ${roleName}\n`);
      healthyModels[roleName] = roleConfig.current;
      report.push({ role: roleName, model: roleConfig.current, status: "no_healthy_model", latency });
    }
  }

  config.lastHealthCheck = new Date().toISOString();
  config.lastHealthyModels = healthyModels;
  saveConfig(config);

  console.log("=== SUMMARY ===");
  for (const r of report) {
    const icon = r.status === "healthy" ? "OK" : r.status === "swapped" ? "SWAPPED" : r.status === "pinned_unhealthy" ? "PINNED" : "FAIL";
    const extra = r.replacedFrom ? ` (was: ${r.replacedFrom})` : "";
    console.log(`  [${icon}] ${r.role}: ${r.model}${extra} (${r.latency}ms)`);
  }

  console.log(`\nChanged: ${changed}`);

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    const changes = report.filter((r) => r.status === "swapped");
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `changes_json=${JSON.stringify(changes)}\n`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
