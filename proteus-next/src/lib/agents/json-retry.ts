import { chatCompletion, extractJson } from "../nim-client";
import { ZodSchema } from "zod";

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
  return s;
}

async function callAndParse<T>(
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  schema: ZodSchema<T>,
  maxTokens: number,
  cleanControlChars: boolean
): Promise<T> {
  const response = await chatCompletion(model, messages, {
    temperature: 0.0,
    maxTokens,
  });

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
  } = {}
): Promise<T> {
  const { temperature = 0.3, maxTokens = 4096, maxRetries = 2, cleanControlChars = false, role } = options;

  let messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userContent },
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await chatCompletion(model, messages, {
        temperature: attempt === 0 ? temperature : 0.0,
        maxTokens,
      });

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

  // Primary model failed — try fallback models
  if (role) {
    const fallbacks = getFallbackModels(role);
    for (const fallback of fallbacks) {
      try {
        return await callAndParse(fallback, [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userContent },
        ], schema, maxTokens, cleanControlChars);
      } catch {
        // Fallback also failed, try next
      }
    }
  }

  throw lastError || new Error("Operation failed after retries and fallbacks");
}
