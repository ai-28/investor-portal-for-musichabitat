import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { AssistantTrack, IndexedChunk, RagIndex } from "./types";
import { resolveChunkTrack } from "./tracks";

let cached: RagIndex | null = null;

function indexPath(): string {
  return process.env.RAG_INDEX_PATH || join(process.cwd(), "data", "rag-index.json");
}

export function loadRagIndex(): RagIndex {
  if (cached) return cached;

  const path = indexPath();
  if (!existsSync(path)) {
    throw new Error(
      `RAG index not found at ${path}. Run "npm run rag:ingest" (or deploy with build-time ingest).`,
    );
  }

  const raw = readFileSync(path, "utf8");
  cached = JSON.parse(raw) as RagIndex;

  if (!cached.chunks?.length) {
    throw new Error("RAG index is empty.");
  }

  return cached;
}

export function getAllChunks(): IndexedChunk[] {
  return loadRagIndex().chunks;
}

export function getChunksForTrack(track: AssistantTrack): IndexedChunk[] {
  return getAllChunks().filter((chunk) => resolveChunkTrack(chunk.metadata) === track);
}

export function clearRagIndexCache(): void {
  cached = null;
}
