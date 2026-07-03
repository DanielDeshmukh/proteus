import { chatCompletion, extractJson } from "../nim-client";
import { ZodSchema } from "zod";

const RETRY_SUFFIX = `\n\nIMPORTANT: Your previous response was NOT valid JSON. You MUST return ONLY a valid JSON object. No text before or after. No markdown code fences. No explanation. Just the raw JSON starting with { and ending with }.`;

function getFallbackModels(role: string): string[] {
  try {
    const path = require("path");
    const fs = require("fs");
    const configPath = path.join(process.cwd(), "models.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const roleConfig = config.roles[role];
    if (roleConfig?.fallbacks) {
      return roleConfig.fallbacks.filter((m: string) => m !== roleConfig.current);
    }
  } catch {}
  return [];
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

  // Try primary model with retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await chatCompletion(model, messages, {
        temperature: attempt === 0 ? temperature : 0.0,
        maxTokens,
      });

      let jsonStr = extractJson(response);
      if (cleanControlChars) {
        jsonStr = jsonStr.replace(/[\x00-\x1f\x7f]/g, (ch) =>
          ch === "\n" ? "\\n" : ch === "\r" ? "" : ch === "\t" ? "\\t" : ""
        );
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
        const response = await chatCompletion(fallback, [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userContent },
        ], {
          temperature: 0.0,
          maxTokens,
        });

        let jsonStr = extractJson(response);
        if (cleanControlChars) {
          jsonStr = jsonStr.replace(/[\x00-\x1f\x7f]/g, (ch) =>
            ch === "\n" ? "\\n" : ch === "\r" ? "" : ch === "\t" ? "\\t" : ""
          );
        }

        const parsed = JSON.parse(jsonStr);
        return schema.parse(parsed);
      } catch {
        // Fallback also failed, try next
      }
    }
  }

  throw lastError || new Error("Operation failed after retries and fallbacks");
}
