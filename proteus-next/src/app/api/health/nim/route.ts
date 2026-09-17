import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";

const PIPELINE_STEPS = [
  { step: 1, agent: "JD Parser",         role: "jd-parser",        task: "Extract structured requirements" },
  { step: 2, agent: "Resume Parser",     role: "resume-parser",    task: "Break resume into structured units" },
  { step: 3, agent: "Gap Analyzer",      role: "gap-analyzer",     task: "Score semantic match via exact matching" },
  { step: 4, agent: "Rewrite Suggester", role: "rewrite-suggester", task: "Draft JD-aware bullet rewrites" },
  { step: 5, agent: "Cover Letter",      role: "cover-letter",     task: "Write tailored cover letter" },
];

const ERROR_CLASSES: Record<string, { name: string; fix: string }> = {
  "502": { name: "BAD_GATEWAY",     fix: "Upstream timeout. Retry after 5-10s." },
  "503": { name: "SERVICE_UNAVAIL", fix: "Service temporarily down. Wait 30s." },
  "429": { name: "RATE_LIMITED",    fix: "Rate limit hit. Wait 60s." },
  "401": { name: "AUTH_FAILED",     fix: "Invalid API key." },
  "403": { name: "FORBIDDEN",       fix: "Key lacks access to this model." },
  "404": { name: "MODEL_NOT_FOUND", fix: "Model not available." },
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

async function testChat(model: string, apiKey: string, baseUrl: string, testPrompt?: string, timeout = 30000): Promise<Omit<TestResult, "step" | "agent" | "task" | "provider">> {
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
      const cls = ERROR_CLASSES[String(res.status)] || { name: "UNKNOWN", fix: "Check API status." };
      return { model, ok: false, latency, error: `HTTP ${res.status}: ${body.substring(0, 100)}`, errorClass: cls.name, fix: cls.fix };
    }
    try {
      const data = JSON.parse(body);
      const content = data.choices?.[0]?.message?.content || "";
      const jsonStr = extractJson(content);
      JSON.parse(jsonStr);
    } catch {
      return { model, ok: false, latency, error: "Model returned non-JSON response", errorClass: "INVALID_OUTPUT", fix: "Try a different model." };
    }
    return { model, ok: true, latency };
  } catch (e: any) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (e.name === "AbortError") return { model, ok: false, latency, error: `Timeout ${timeout}ms`, errorClass: "TIMEOUT", fix: "API overloaded. Retry or switch model." };
    return { model, ok: false, latency, error: e.message, errorClass: "NETWORK", fix: "Check internet connection." };
  }
}

export async function GET() {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

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

    const provider = cfg.provider || "groq";
    let base;

    if (provider === "gemini") {
      if (!geminiApiKey) {
        base = { model: cfg.current, ok: false, latency: 0, error: "GEMINI_API_KEY not set", errorClass: "CONFIG", fix: "Set GEMINI_API_KEY environment variable." };
      } else {
        base = await testChat(cfg.current, geminiApiKey, GEMINI_BASE_URL, cfg.testPrompt);
      }
    } else {
      if (!groqApiKey) {
        base = { model: cfg.current, ok: false, latency: 0, error: "GROQ_API_KEY not set", errorClass: "CONFIG", fix: "Set GROQ_API_KEY environment variable." };
      } else {
        base = await testChat(cfg.current, groqApiKey, GROQ_BASE_URL, cfg.testPrompt);
      }
    }

    results.push({ ...step, ...base, provider });
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
