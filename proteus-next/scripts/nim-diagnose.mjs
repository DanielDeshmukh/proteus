#!/usr/bin/env node
// proteus-next/scripts/nim-diagnose.mjs
// Deep NIM diagnostics — tests all endpoints, classifies errors, suggests fixes
// Usage: node scripts/nim-diagnose.mjs [--verbose] [--json]

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEXT_ROOT = join(__dirname, "..");
const CONFIG_PATH = join(NEXT_ROOT, "models.json");
const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const VERBOSE = process.argv.includes("--verbose");
const JSON_OUT = process.argv.includes("--json");

const API_KEY = process.env.NVIDIA_NIM_API_KEY;
if (!API_KEY) {
  console.error("FATAL: NVIDIA_NIM_API_KEY not set");
  process.exit(1);
}

// ── Error Classification ─────────────────────────────────

const ERROR_CLASS = {
  "502": { name: "BAD_GATEWAY",     fix: "NIM upstream timeout or overload. Retry after 5-10s, or switch model." },
  "503": { name: "SERVICE_UNAVAIL", fix: "NIM service temporarily down. Wait 30s and retry, or use fallback model." },
  "429": { name: "RATE_LIMITED",    fix: "NVIDIA API rate limit hit. Wait 60s, reduce request frequency, or upgrade plan." },
  "408": { name: "REQUEST_TIMEOUT", fix: "Request took too long. Increase timeout or reduce max_tokens." },
  "401": { name: "AUTH_FAILED",     fix: "Invalid or expired API key. Regenerate at build.nvidia.com." },
  "403": { name: "FORBIDDEN",       fix: "API key lacks access to this model. Check model availability on build.nvidia.com." },
  "404": { name: "MODEL_NOT_FOUND", fix: "Model does not exist or was removed. Switch to an available model." },
  "413": { name: "PAYLOAD_TOO_LARGE", fix: "Input too long. Reduce token count or split into chunks." },
};

function classifyError(status, body) {
  const cls = ERROR_CLASS[String(status)] || { name: "UNKNOWN", fix: "Check NIM status at build.nvidia.com." };
  let detail = "";
  try {
    const parsed = JSON.parse(body);
    detail = parsed.error?.message || parsed.message || body.substring(0, 200);
  } catch {
    detail = body.substring(0, 200);
  }
  return { ...cls, status, detail };
}

// ── Test Functions ───────────────────────────────────────

async function testChat(model, timeout = 30000) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: 'Return exactly: {"ok":true}' }],
        max_tokens: 30,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    const body = await res.text();
    if (!res.ok) return { ok: false, latency, error: classifyError(res.status, body) };
    const data = JSON.parse(body);
    const content = data.choices?.[0]?.message?.content || "";
    return { ok: true, latency, content: content.substring(0, 100) };
  } catch (e) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (e.name === "AbortError") return { ok: false, latency, error: { name: "TIMEOUT", status: 0, fix: `Request exceeded ${timeout}ms. NIM may be overloaded.`, detail: `Timeout after ${timeout}ms` } };
    return { ok: false, latency, error: { name: "NETWORK", status: 0, fix: "DNS or network failure. Check internet connection.", detail: e.message } };
  }
}

async function testEmbed(model, timeout = 15000) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${NIM_BASE_URL}/embeddings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: "diagnostic test", input_type: "query" }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    const body = await res.text();
    if (!res.ok) return { ok: false, latency, error: classifyError(res.status, body) };
    const data = JSON.parse(body);
    const dims = data.data?.[0]?.embedding?.length || 0;
    return { ok: true, latency, dims };
  } catch (e) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (e.name === "AbortError") return { ok: false, latency, error: { name: "TIMEOUT", status: 0, fix: `Embedding timeout after ${timeout}ms.`, detail: `Timeout after ${timeout}ms` } };
    return { ok: false, latency, error: { name: "NETWORK", status: 0, fix: "Network failure.", detail: e.message } };
  }
}

async function checkCatalog() {
  const start = Date.now();
  try {
    const res = await fetch(`${NIM_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });
    const latency = Date.now() - start;
    if (!res.ok) return { ok: false, latency, count: 0, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, latency, count: data.data?.length || 0, models: data.data?.map(m => m.id) || [] };
  } catch (e) {
    return { ok: false, latency: Date.now() - start, count: 0, error: e.message };
  }
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  const results = { timestamp: new Date().toISOString(), catalog: null, roles: {} };

  console.log("═══════════════════════════════════════════════════════");
  console.log("  PROTEUS NIM DIAGNOSTICS");
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Catalog check
  console.log("▸ Checking NIM catalog...");
  results.catalog = await checkCatalog();
  if (results.catalog.ok) {
    console.log(`  ✓ ${results.catalog.count} models available (${results.catalog.latency}ms)\n`);
  } else {
    console.log(`  ✗ Catalog unreachable: ${results.catalog.error}\n`);
  }

  // 2. Test each configured model
  for (const [role, cfg] of Object.entries(config.roles)) {
    const isEmbed = cfg.type === "embedding";
    console.log(`▸ [${role}] Testing ${cfg.current}...`);

    const result = isEmbed
      ? await testEmbed(cfg.current)
      : await testChat(cfg.current);

    results.roles[role] = { model: cfg.current, ...result };

    if (result.ok) {
      const extra = isEmbed ? `${result.dims}dims` : `"${result.content}"`;
      console.log(`  ✓ HEALTHY (${result.latency}ms) ${extra}`);
    } else {
      console.log(`  ✗ UNHEALTHY — ${result.error.name} (HTTP ${result.error.status})`);
      console.log(`    Detail: ${result.error.detail}`);
      console.log(`    Fix: ${result.error.fix}`);

      // Test fallbacks
      if (cfg.fallbacks?.length) {
        console.log(`  Testing ${cfg.fallbacks.length} fallback models...`);
        for (const fb of cfg.fallbacks) {
          if (fb === cfg.current) continue;
          const fbResult = isEmbed ? await testEmbed(fb) : await testChat(fb);
          if (fbResult.ok) {
            console.log(`    ✓ Fallback healthy: ${fb} (${fbResult.latency}ms)`);
            results.roles[role].suggestedFallback = fb;
            break;
          } else {
            console.log(`    ✗ ${fb}: ${fbResult.error.name}`);
          }
        }
      }
    }
    console.log();
  }

  // 3. Summary
  console.log("═══════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  const healthy = Object.values(results.roles).filter(r => r.ok).length;
  const total = Object.keys(results.roles).length;
  console.log(`  ${healthy}/${total} models healthy`);
  for (const [role, r] of Object.entries(results.roles)) {
    const icon = r.ok ? "✓" : "✗";
    const fallback = r.suggestedFallback ? ` → suggested: ${r.suggestedFallback}` : "";
    console.log(`  ${icon} ${role}: ${r.model} (${r.latency}ms)${fallback}`);
  }

  if (JSON_OUT) {
    console.log("\n" + JSON.stringify(results, null, 2));
  }
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
