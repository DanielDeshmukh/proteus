import OpenAI from "openai";

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
  return text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
}

export async function embedTexts(
  texts: string[],
  model: string = "nvidia/nv-embedqa-e5-v5",
  inputType: "query" | "passage" = "passage"
): Promise<number[][]> {
  const nim = getClient();

  const response = await nim.embeddings.create({
    model,
    input: texts,
    input_type: inputType,
  });

  return response.data.map((item) => item.embedding);
}
