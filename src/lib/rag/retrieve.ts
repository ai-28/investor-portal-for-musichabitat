import { getChunksForTrack } from "./index";
import type { AssistantTrack, RetrievedChunk, SourceCitation } from "./types";

const DEFAULT_TOP_K = 8;
const MIN_SCORE = 0.25;

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

/** Cosine similarity between two vectors. */
function cosineSimilarity(a: number[], b: number[]): number {
  const denom = norm(a) * norm(b);
  if (!denom) return 0;
  return dot(a, b) / denom;
}

export async function retrieveRelevantChunks(
  queryEmbedding: number[],
  track: AssistantTrack,
  topK = DEFAULT_TOP_K,
): Promise<RetrievedChunk[]> {
  const chunks = getChunksForTrack(track);

  if (!chunks.length) {
    throw new Error(
      `RAG index has no chunks for track "${track}". Run npm run rag:ingest.`,
    );
  }

  const scored = chunks.map((chunk) => ({
    text: chunk.text,
    metadata: chunk.metadata,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  const filtered = scored.filter((c) => c.score >= MIN_SCORE).slice(0, topK);

  if (filtered.length === 0 && scored.length > 0) {
    return scored.slice(0, Math.min(3, topK));
  }

  return filtered;
}

function displayFilename(sourceFile: string): string {
  const parts = sourceFile.split("/");
  return parts[parts.length - 1] || sourceFile;
}

export function chunksToSources(chunks: RetrievedChunk[]): SourceCitation[] {
  const seen = new Set<string>();
  const sources: SourceCitation[] = [];

  for (const chunk of chunks) {
    const filename = displayFilename(chunk.metadata.sourceFile);
    const key = `${chunk.metadata.sourceUrl}:${chunk.metadata.page}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({
      filename,
      page: chunk.metadata.page >= 0 ? chunk.metadata.page : undefined,
      url: chunk.metadata.sourceUrl,
    });
  }

  return sources;
}

export function formatContextBlock(chunks: RetrievedChunk[]): string {
  if (!chunks.length) return "(No relevant excerpts retrieved.)";

  return chunks
    .map((chunk, i) => {
      const page =
        chunk.metadata.page >= 0 ? `, page ${chunk.metadata.page}` : "";
      const name = displayFilename(chunk.metadata.sourceFile);
      return `[${i + 1}] ${name}${page}\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
}
