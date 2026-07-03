import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";

const PIPELINE_STEPS = [
  { step: 1, agent: "JD Parser",       role: "parser",   task: "Extract structured requirements" },
  { step: 2, agent: "Resume Parser",   role: "parser",   task: "Break resume into structured units" },
  { step: 3, agent: "Gap Analyzer",    role: "embedder", task: "Score semantic match via embeddings" },
  { step: 4, agent: "Rewrite Suggester", role: "rewriter", task: "Draft JD-aware bullet rewrites" },
  { step: 5, agent: "Cover Letter",    role: "rewriter", task: "Write tailored cover letter" },
];

const ERROR_CLASS: Record<string, { name: string; fix: string }> = {
  "502": { name: "BAD_GATEWAY",     fix: "NIM upstream timeout. Retry after 5-10s or switch model." },
  "503": { name: "SERVICE_UNAVAIL", fix: "NIM temporarily down. Wait 30s and retry." },
  "429": { name: "RATE_LIMITED",    fix: "Rate limit hit. Wait 60s or reduce frequency." },
  "401": { name: "AUTH_FAILED",     fix: "Invalid API key. Regenerate at build.nvidia.com." },
  "403": { name: "FORBIDDEN",       fix: "Key lacks access to this model." },
  "404": { name: "MODEL_NOT_FOUND", fix: "Model removed or unavailable." },
};

interface TestResult {
  step: number;
  agent: string;
  task: string;
  model: string;
  ok: boolean;
  latency: number;
  error?: string;
  errorClass?: string;
  fix?: string;
}

async function testChat(model: string, apiKey: string, timeout = 30000): Promise<Omit<TestResult, "step" | "agent" | "task">> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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
    if (!res.ok) {
      const cls = ERROR_CLASS[String(res.status)] || { name: "UNKNOWN", fix: "Check NIM status." };
      return { model, ok: false, latency, error: `HTTP ${res.status}: ${body.substring(0, 100)}`, errorClass: cls.name, fix: cls.fix };
    }
    return { model, ok: true, latency };
  } catch (e: any) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (e.name === "AbortError") return { model, ok: false, latency, error: `Timeout ${timeout}ms`, errorClass: "TIMEOUT", fix: "NIM overloaded. Retry or switch model." };
    return { model, ok: false, latency, error: e.message, errorClass: "NETWORK", fix: "Check internet connection." };
  }
}

async function testEmbed(model: string, apiKey: string, timeout = 15000): Promise<Omit<TestResult, "step" | "agent" | "task">> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${NIM_BASE_URL}/embeddings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: "diagnostic test", input_type: "query" }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    const body = await res.text();
    if (!res.ok) {
      const cls = ERROR_CLASS[String(res.status)] || { name: "UNKNOWN", fix: "Check NIM status." };
      return { model, ok: false, latency, error: `HTTP ${res.status}`, errorClass: cls.name, fix: cls.fix };
    }
    return { model, ok: true, latency };
  } catch (e: any) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (e.name === "AbortError") return { model, ok: false, latency, error: `Timeout ${timeout}ms`, errorClass: "TIMEOUT", fix: "Embedding timeout." };
    return { model, ok: false, latency, error: e.message, errorClass: "NETWORK", fix: "Network failure." };
  }
}

export async function GET() {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ status: "error", message: "NVIDIA_NIM_API_KEY not set" }, { status: 500 });
  }

  const configPath = join(process.cwd(), "models.json");
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    return NextResponse.json({ status: "error", message: "models.json not found" }, { status: 500 });
  }

  const results: TestResult[] = [];

  // Test each pipeline step (not just unique roles)
  for (const step of PIPELINE_STEPS) {
    const cfg = config.roles[step.role];
    if (!cfg) continue;

    const isEmbed = cfg.type === "embedding";
    const base = isEmbed
      ? await testEmbed(cfg.current, apiKey)
      : await testChat(cfg.current, apiKey);

    results.push({ ...step, ...base });
  }

  const healthy = results.filter(r => r.ok).length;

  return NextResponse.json({
    status: healthy === results.length ? "healthy" : "degraded",
    healthy,
    total: results.length,
    results,
    checkedAt: new Date().toISOString(),
  });
}
