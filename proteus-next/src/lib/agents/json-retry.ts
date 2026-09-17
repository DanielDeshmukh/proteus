import { groqChatCompletion } from "../groq-client";
import { geminiChatCompletion } from "../gemini-client";
import { ZodSchema } from "zod";

function extractJson(text: string): string {
  let cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let start = -1;
  if (firstBrace >= 0 && firstBracket >= 0) start = Math.min(firstBrace, firstBracket);
  else if (firstBrace >= 0) start = firstBrace;
  else if (firstBracket >= 0) start = firstBracket;
  if (start > 0) cleaned = cleaned.substring(start);
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
    const lastClose = cleaned.lastIndexOf(closeChar);
    if (lastClose >= 0) cleaned = cleaned.substring(0, lastClose + 1);
  }
  return cleaned.trim();
}

const RETRY_SUFFIX = `\n\nIMPORTANT: Your previous response was NOT valid JSON. You MUST return ONLY a valid JSON object. No text before or after. No markdown code fences. No explanation. Just the raw JSON starting with { and ending with }.`;

function getFallbackModels(role: string): string[] {
  try {
    const path = require("path"); // eslint-disable-line @typescript-eslint/no-require-imports
    const fs = require("fs"); // eslint-disable-line @typescript-eslint/no-require-imports
    const configPath = path.join(process.cwd(), "models.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const roleConfig = config.roles[role];
    if (roleConfig?.fallbacks) {
      return roleConfig.fallbacks.filter((m: string) => m !== roleConfig.current);
    }
  } catch {}
  return [];
}

function repairJson(raw: string): string {
  let s = raw;
  // Strip markdown fences
  s = s.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  // Replace control chars inside string values
  s = s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, (ch) =>
    ch === "\n" ? "\\n" : ch === "\r" ? "" : ch === "\t" ? "\\t" : ""
  );
  // Fix trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");
  // Remove trailing text after closing brace/bracket
  const lastBrace = s.lastIndexOf("}");
  const lastBracket = s.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);
  if (end >= 0 && end < s.length - 1) s = s.substring(0, end + 1);
  return s;
}

async function callAndParse<T>(
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  schema: ZodSchema<T>,
  maxTokens: number,
  cleanControlChars: boolean,
  provider: string = "groq"
): Promise<T> {
  let response: string;
  if (provider === "gemini") {
    response = await geminiChatCompletion(model, messages, { temperature: 0.0, maxTokens });
  } else {
    response = await groqChatCompletion(model, messages, { temperature: 0.0, maxTokens });
  }

  let jsonStr = extractJson(response);
  if (cleanControlChars) {
    jsonStr = repairJson(jsonStr);
  }

  const parsed = JSON.parse(jsonStr);
  return schema.parse(parsed);
}

export async function callWithJsonRetry<T>(
  model: string,
  systemPrompt: string,
  userContent: string,
  schema: ZodSchema<T>,
  options: {
    temperature?: number;
    maxTokens?: number;
    maxRetries?: number;
    cleanControlChars?: boolean;
    role?: string;
    provider?: string;
  } = {}
): Promise<T> {
  const { temperature = 0.3, maxTokens = 4096, maxRetries = 2, cleanControlChars = false, role, provider = "groq" } = options;

  let messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userContent },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      let response: string;
      const temp = attempt === 0 ? temperature : 0.0;
      if (provider === "gemini") {
        response = await geminiChatCompletion(model, messages, { temperature: temp, maxTokens });
      } else {
        response = await groqChatCompletion(model, messages, { temperature: temp, maxTokens });
      }

      let jsonStr = extractJson(response);
      if (cleanControlChars) {
        jsonStr = repairJson(jsonStr);
      }

      const parsed = JSON.parse(jsonStr);
      return schema.parse(parsed);
    } catch (e: any) {
      lastError = e;
      messages = [
        { role: "system" as const, content: systemPrompt + RETRY_SUFFIX },
        { role: "user" as const, content: userContent },
      ];
    }
  }

  // Primary model failed — try Groq fallbacks
  if (role) {
    const fallbacks = getFallbackModels(role);
    for (const fallback of fallbacks) {
      try {
        return await callAndParse(fallback, [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userContent },
        ], schema, maxTokens, cleanControlChars, "groq");
      } catch {
        // Fallback also failed, try next
      }
    }

    // Groq fallbacks exhausted — try Gemini
    try {
      const configPath = require("path").join(process.cwd(), "models.json");
      const config = JSON.parse(require("fs").readFileSync(configPath, "utf-8"));
      const geminiModel = config.roles[role]?.gemini_model;
      if (geminiModel) {
        console.log(`[json-retry] All Groq models failed for ${role}, trying Gemini: ${geminiModel}`);
        return await callAndParse(geminiModel, [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userContent },
        ], schema, maxTokens, cleanControlChars, "gemini");
      }
    } catch {
      // Config load failed, ignore
    }
  }

  throw lastError || new Error("Operation failed after retries and fallbacks");
}
