import OpenAI from "openai";
import { getEmbeddingModel } from "./model-config";

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.NVIDIA_NIM_API_KEY;
    if (!apiKey) {
      throw new Error("NVIDIA_NIM_API_KEY environment variable is not set");
    }
    client = new OpenAI({
      apiKey,
      baseURL: NIM_BASE_URL,
      timeout: 120000,
    });
  }
  return client;
}

export async function chatCompletion(
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" };
  } = {}
): Promise<string> {
  const { temperature = 0.3, maxTokens = 4096, responseFormat } = options;
  const nim = getClient();

  const response = await nim.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    ...(responseFormat && { response_format: responseFormat }),
  });

  return response.choices[0]?.message?.content ?? "";
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

  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  let end = -1;
  if (lastBrace >= 0 && lastBracket >= 0) end = Math.max(lastBrace, lastBracket);
  else if (lastBrace >= 0) end = lastBrace;
  else if (lastBracket >= 0) end = lastBracket;

  if (end >= 0 && end < cleaned.length - 1) cleaned = cleaned.substring(0, end + 1);

  return cleaned.trim();
}

export async function embedTexts(
  texts: string[],
  model?: string,
  inputType: "query" | "passage" = "passage"
): Promise<number[][]> {
  const nim = getClient();

  const response = await nim.embeddings.create({
    model: model || getEmbeddingModel(),
    input: texts,
    input_type: inputType,
  } as any);

  return response.data.map((item) => item.embedding);
}
