import OpenAI from "openai";

const DEFAULT_MODEL = "text-embedding-3-small";

function embeddingModel(): string {
  return process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_MODEL;
}

const CHAT_MODEL = "gpt-4o-mini";

function openaiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAI({ apiKey });
}

export async function embedQuery(text: string): Promise<number[]> {
  const client = openaiClient();
  const res = await client.embeddings.create({
    model: embeddingModel(),
    input: text,
  });
  return res.data[0].embedding;
}

export { openaiClient, CHAT_MODEL };
