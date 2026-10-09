import OpenAI from "openai";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_NATIVE_URL = "https://generativelanguage.googleapis.com/v1beta";
const EMBED_BATCH_SIZE = 64;
const EMBED_TIMEOUT_MS = 20000;
const EMBED_MAX_ATTEMPTS = 2;

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return apiKey;
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: getApiKey(),
      baseURL: GEMINI_BASE_URL,
      timeout: 55000,
    });
  }
  return client;
}

export async function geminiChatCompletion(
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const { temperature = 0.3, maxTokens = 4096 } = options;
  const gemini = getClient();

  const response = await gemini.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content ?? "";
}

async function embedChunk(model: string, texts: string[]): Promise<number[][]> {
  const apiKey = getApiKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);
  try {
    const res = await fetch(`${GEMINI_NATIVE_URL}/models/${model}:batchEmbedContents`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${model}`,
          content: { parts: [{ text }] },
        })),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini embed HTTP ${res.status}: ${body.substring(0, 200)}`);
    }
    const data = await res.json();
    const embeddings: Array<{ values?: number[] }> = data.embeddings || [];
    if (embeddings.length !== texts.length || embeddings.some((e) => !e.values || e.values.length === 0)) {
      throw new Error("Gemini embed returned incomplete embeddings");
    }
    return embeddings.map((e) => e.values as number[]);
  } catch (e) {
    clearTimeout(timer);
    throw e instanceof Error && e.name === "AbortError" ? new Error(`Gemini embed timeout ${EMBED_TIMEOUT_MS}ms`) : e;
  }
}

export async function geminiEmbed(model: string, texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const chunk = texts.slice(i, i + EMBED_BATCH_SIZE);
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= EMBED_MAX_ATTEMPTS; attempt++) {
      try {
        results.push(...(await embedChunk(model, chunk)));
        lastError = null;
        break;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        if (attempt < EMBED_MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 500));
      }
    }
    if (lastError) throw lastError;
  }
  return results;
}
