import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { embedQuery, CHAT_MODEL, openaiClient } from "@/lib/rag/embed";
import { retrieveRelevantChunks, chunksToSources } from "@/lib/rag/retrieve";
import { buildSystemPrompt, trimHistory } from "@/lib/rag/prompt";
import type { AssistantTrack, ChatMessage } from "@/lib/rag/types";

export const maxDuration = 30;

const FALLBACK =
  "I wasn't able to find enough information in the offering documents to answer that. Please review the Document Center or email brandon@musichabitat.com.";

function isTrack(value: unknown): value is AssistantTrack {
  return value === "ff" || value === "private";
}

export async function POST(request: Request) {
  try {
    await requireSessionUser();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Assistant is not configured. Set OPENAI_API_KEY." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      track?: AssistantTrack;
      messages?: ChatMessage[];
    };

    const track = body.track ?? "ff";
    if (!isTrack(track)) {
      return NextResponse.json({ error: "Invalid track" }, { status: 400 });
    }

    const messages = body.messages ?? [];
    if (!messages.length || messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const lastUser = messages[messages.length - 1].content;
    const queryEmbedding = await embedQuery(lastUser);
    const chunks = await retrieveRelevantChunks(queryEmbedding, track);

    if (!chunks.length) {
      return NextResponse.json({ text: FALLBACK, sources: [] });
    }

    const system = buildSystemPrompt(track, chunks);
    const history = trimHistory(messages);

    const client = openaiClient();
    const completion = await client.chat.completions.create({
      model: CHAT_MODEL,
      max_tokens: 1000,
      messages: [{ role: "system", content: system }, ...history],
    });

    const text =
      completion.choices[0]?.message?.content?.trim() ||
      FALLBACK;

    const sources = chunksToSources(chunks);

    return NextResponse.json({ text, sources });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message.includes("RAG index not found")) {
      return NextResponse.json(
        { error: "Assistant knowledge base is not built. Run npm run rag:ingest." },
        { status: 503 },
      );
    }
    console.error("POST /api/assistant", err);
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
