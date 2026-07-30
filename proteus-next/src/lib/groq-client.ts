import OpenAI from "openai";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }
    client = new OpenAI({
      apiKey,
      baseURL: GROQ_BASE_URL,
      timeout: 30000,
    });
  }
  return client;
}

export async function groqChatCompletion(
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const { temperature = 0.3, maxTokens = 4096 } = options;
  const groq = getClient();

  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content ?? "";
}
