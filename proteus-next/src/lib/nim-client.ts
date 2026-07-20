import OpenAI from "openai";
import { getEmbeddingModel } from "./model-config";

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";

let client: OpenAI | null = null;

// ── Error Classification ─────────────────────────────────

export interface NimError {
  code: number;
  name: string;
  message: string;
  fix: string;
  retryable: boolean;
}

const ERROR_MAP: Record<number, Omit<NimError, "code" | "message">> = {
  502: { name: "BAD_GATEWAY",     fix: "NIM upstream timeout. Retry in 5-10s.", retryable: true },
  503: { name: "SERVICE_UNAVAIL", fix: "NIM temporarily down. Retry in 30s.", retryable: true },
  429: { name: "RATE_LIMITED",    fix: "Rate limit. Wait 60s.", retryable: true },
  408: { name: "REQUEST_TIMEOUT", fix: "Request too slow. Reduce max_tokens.", retryable: true },
  401: { name: "AUTH_FAILED",     fix: "Invalid API key.", retryable: false },
  403: { name: "FORBIDDEN",       fix: "Key lacks model access.", retryable: false },
  404: { name: "MODEL_NOT_FOUND", fix: "Model unavailable.", retryable: false },
};

export function classifyNimError(status: number, body?: string): NimError {
  const cls = ERROR_MAP[status] || { name: "UNKNOWN", fix: "Check NIM status.", retryable: false };
  let message = `HTTP ${status}`;
  try {
    if (body) {
      const parsed = JSON.parse(body);
      message = parsed.error?.message || parsed.message || message;
    }
  } catch {
    if (body) message = body.substring(0, 200);
  }
  return { code: status, ...cls, message };
}

// ── Client ───────────────────────────────────────────────

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.NVIDIA_NIM_API_KEY;
    if (!apiKey) {
      throw new Error("NVIDIA_NIM_API_KEY environment variable is not set");
    }
    client = new OpenAI({
      apiKey,
      baseURL: NIM_BASE_URL,
      timeout: 45000,
    });
  }
  return client;
}

// ── Retry with Fallback ─────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  role: string,
  maxRetries = 1,
  retryDelay = 2000
): Promise<T> {
  let lastError: NimError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      const status = e?.status || e?.response?.status;
      const body = e?.error?.message || e?.message || "";

      if (status) {
        lastError = classifyNimError(status, body);
      } else if (e.name === "AbortError" || e.code === "ETIMEDOUT") {
        lastError = { code: 0, name: "TIMEOUT", message: e.message, fix: "NIM timed out.", retryable: true };
      } else {
        lastError = { code: 0, name: "NETWORK", message: e.message, fix: "Network failure.", retryable: true };
      }

      if (!lastError.retryable || attempt === maxRetries) break;

      // Exponential backoff
      await new Promise(r => setTimeout(r, retryDelay * Math.pow(2, attempt)));
    }
  }

  // Try fallback model (read-only: no disk write)
  try {
    const configPath = require("path").join(process.cwd(), "models.json"); // eslint-disable-line @typescript-eslint/no-require-imports
    const config = JSON.parse(require("fs").readFileSync(configPath, "utf-8")); // eslint-disable-line @typescript-eslint/no-require-imports
    const roleConfig = config.roles[role];
    if (roleConfig?.fallbacks?.length) {
      const currentModel = roleConfig.current;
      const fallback = roleConfig.fallbacks.find((m: string) => m !== currentModel);
      if (fallback) {
        console.log(`[NIM] ${role} failed (${lastError?.name}), trying fallback: ${fallback}`);
        const fallbackClient = new OpenAI({
          apiKey: process.env.NVIDIA_NIM_API_KEY,
          baseURL: NIM_BASE_URL,
          timeout: 45000,
        });
        try {
          // Test fallback with a minimal request
          await fallbackClient.chat.completions.create({
            model: fallback,
            messages: [{ role: "user", content: 'Return exactly: {"ok":true}' }],
            max_tokens: 30,
            temperature: 0.1,
          });
          // Fallback works — update in-memory config (no disk write on Vercel)
          roleConfig.current = fallback;
          // Re-run original fn with updated config
          return await fn();
        } catch {
          // Fallback also failed
        }
      }
    }
  } catch {
    // Config load failed, ignore
  }

  throw lastError || new Error("Unknown NIM error");
}

// ── Public API ───────────────────────────────────────────

export async function chatCompletion(
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" };
    role?: string;
  } = {}
): Promise<string> {
  const { temperature = 0.3, maxTokens = 4096, responseFormat, role } = options;
  const nim = getClient();

  return withRetry(async () => {
    const response = await nim.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(responseFormat && { response_format: responseFormat }),
    });
    return response.choices[0]?.message?.content ?? "";
  }, role || "parser");
}

export function extractJson(text: string): string {
  let cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let start = -1;
  if (firstBrace >= 0 && firstBracket >= 0) start = Math.min(firstBrace, firstBracket);
  else if (firstBrace >= 0) start = firstBrace;
  else if (firstBracket >= 0) start = firstBracket;

  if (start > 0) cleaned = cleaned.substring(start);

  // Find matching closing bracket/brace by counting depth
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;
  const startChar = cleaned[0];
  const closeChar = startChar === "{" ? "}" : "]";

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === startChar || ch === closeChar) {
      if (ch === startChar) depth++;
      else depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  if (end >= 0) cleaned = cleaned.substring(0, end + 1);
  else {
    // Fallback: last occurrence
    const lastClose = cleaned.lastIndexOf(closeChar);
    if (lastClose >= 0) cleaned = cleaned.substring(0, lastClose + 1);
  }

  return cleaned.trim();
}

export async function embedTexts(
  texts: string[],
  model?: string,
  inputType: "query" | "passage" = "passage"
): Promise<number[][]> {
  const nim = getClient();

  return withRetry(async () => {
    const response = await nim.embeddings.create({
      model: model || getEmbeddingModel(),
      input: texts,
      input_type: inputType,
    } as any);
    return response.data.map((item) => item.embedding);
  }, "embedder");
}
