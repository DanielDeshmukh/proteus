import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

const PIPELINE_STEPS = [
  { step: 1, agent: "JD Parser",         role: "jd-parser",        task: "Extract structured requirements" },
  { step: 2, agent: "Resume Parser",     role: "resume-parser",    task: "Break resume into structured units" },
  { step: 3, agent: "Gap Analyzer",      role: "gap-analyzer",     task: "Score semantic match via embeddings" },
  { step: 4, agent: "Rewrite Suggester", role: "rewrite-suggester", task: "Draft JD-aware bullet rewrites" },
  { step: 5, agent: "Cover Letter",      role: "cover-letter",     task: "Write tailored cover letter" },
];

const NIM_ERROR_CLASS: Record<string, { name: string; fix: string }> = {
  "502": { name: "BAD_GATEWAY",     fix: "NIM upstream timeout. Retry after 5-10s or switch model." },
  "503": { name: "SERVICE_UNAVAIL", fix: "NIM temporarily down. Wait 30s and retry." },
  "429": { name: "RATE_LIMITED",    fix: "Rate limit hit. Wait 60s or reduce frequency." },
  "401": { name: "AUTH_FAILED",     fix: "Invalid API key. Regenerate at build.nvidia.com." },
  "403": { name: "FORBIDDEN",       fix: "Key lacks access to this model." },
  "404": { name: "MODEL_NOT_FOUND", fix: "Model removed or unavailable." },
};

const GROQ_ERROR_CLASS: Record<string, { name: string; fix: string }> = {
  "502": { name: "BAD_GATEWAY",     fix: "Groq upstream timeout. Retry after 5-10s." },
  "503": { name: "SERVICE_UNAVAIL", fix: "Groq temporarily down. Wait 30s and retry." },
  "429": { name: "RATE_LIMITED",    fix: "Groq rate limit hit. Wait 60s." },
  "401": { name: "AUTH_FAILED",     fix: "Invalid GROQ_API_KEY. Check environment variables." },
  "403": { name: "FORBIDDEN",       fix: "Key lacks access to this model." },
  "404": { name: "MODEL_NOT_FOUND", fix: "Model not available on Groq." },
};

interface TestResult {
  step: number;
  agent: string;
  task: string;
  model: string;
  provider: string;
  ok: boolean;
  latency: number;
  error?: string;
  errorClass?: string;
  fix?: string;
  pinned?: boolean;
}

function extractJson(text: string): string {
  let jsonStr = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  const firstBrace = jsonStr.indexOf("{");
  const firstBracket = jsonStr.indexOf("[");
  let start = -1;
  if (firstBrace >= 0 && firstBracket >= 0) start = Math.min(firstBrace, firstBracket);
  else if (firstBrace >= 0) start = firstBrace;
  else if (firstBracket >= 0) start = firstBracket;
  if (start >= 0) jsonStr = jsonStr.substring(start);
  let depth = 0, inStr = false, esc = false, end = -1;
  const closeChar = jsonStr[0] === "{" ? "}" : "]";
  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === jsonStr[0] || ch === closeChar) {
      if (ch === jsonStr[0]) depth++; else depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end >= 0) jsonStr = jsonStr.substring(0, end + 1);
  return jsonStr;
}

async function testChat(model: string, apiKey: string, baseUrl: string, errorClass: Record<string, { name: string; fix: string }>, testPrompt?: string, timeout = 30000): Promise<Omit<TestResult, "step" | "agent" | "task" | "provider">> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: testPrompt || 'Return exactly: {"ok":true}' }],
        max_tokens: 500,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    const body = await res.text();
    if (!res.ok) {
      const cls = errorClass[String(res.status)] || { name: "UNKNOWN", fix: "Check API status." };
      return { model, ok: false, latency, error: `HTTP ${res.status}: ${body.substring(0, 100)}`, errorClass: cls.name, fix: cls.fix };
    }
    try {
      const data = JSON.parse(body);
      const content = data.choices?.[0]?.message?.content || "";
      const jsonStr = extractJson(content);
      JSON.parse(jsonStr);
    } catch {
      return { model, ok: false, latency, error: "Model returned non-JSON response", errorClass: "INVALID_OUTPUT", fix: "Model may not support structured output. Try a different model." };
    }
    return { model, ok: true, latency };
  } catch (e: any) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (e.name === "AbortError") return { model, ok: false, latency, error: `Timeout ${timeout}ms`, errorClass: "TIMEOUT", fix: "API overloaded. Retry or switch model." };
    return { model, ok: false, latency, error: e.message, errorClass: "NETWORK", fix: "Check internet connection." };
  }
}

async function testNimChat(model: string, apiKey: string, testPrompt?: string): Promise<Omit<TestResult, "step" | "agent" | "task" | "provider">> {
  return testChat(model, apiKey, NIM_BASE_URL, NIM_ERROR_CLASS, testPrompt);
}

async function testGroqChat(model: string, apiKey: string, testPrompt?: string): Promise<Omit<TestResult, "step" | "agent" | "task" | "provider">> {
  return testChat(model, apiKey, GROQ_BASE_URL, GROQ_ERROR_CLASS, testPrompt);
}

async function testEmbed(model: string, apiKey: string, timeout = 15000): Promise<Omit<TestResult, "step" | "agent" | "task" | "provider">> {
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
      const cls = NIM_ERROR_CLASS[String(res.status)] || { name: "UNKNOWN", fix: "Check NIM status." };
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
  const nimApiKey = process.env.NVIDIA_NIM_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  const configPath = join(process.cwd(), "models.json");
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    return NextResponse.json({ status: "error", message: "models.json not found" }, { status: 500 });
  }

  const results: TestResult[] = [];

  for (const step of PIPELINE_STEPS) {
    const cfg = config.roles[step.role];
    if (!cfg) continue;

    const provider = cfg.provider || "nvidia-nim";
    const isEmbed = cfg.type === "embedding";

    let base;
    if (provider === "groq") {
      if (!groqApiKey) {
        base = { model: cfg.current, ok: false, latency: 0, error: "GROQ_API_KEY not set", errorClass: "CONFIG", fix: "Set GROQ_API_KEY environment variable." };
      } else {
        base = await testGroqChat(cfg.current, groqApiKey, cfg.testPrompt);
      }
    } else {
      if (!nimApiKey) {
        base = { model: cfg.current, ok: false, latency: 0, error: "NVIDIA_NIM_API_KEY not set", errorClass: "CONFIG", fix: "Set NVIDIA_NIM_API_KEY environment variable." };
      } else if (isEmbed) {
        base = await testEmbed(cfg.current, nimApiKey);
      } else {
        base = await testNimChat(cfg.current, nimApiKey, cfg.testPrompt);
      }
    }

    results.push({ ...step, ...base, provider, pinned: cfg.pinned || false });
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
