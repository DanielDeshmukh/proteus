import OpenAI from "openai";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    client = new OpenAI({
      apiKey,
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
