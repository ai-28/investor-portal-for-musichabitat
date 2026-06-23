import type { AssistantTrack, ChunkMetadata } from "./types";

/** Offering folders under public/assets/docs — keep in sync with scripts/rag/tracks.mjs */
export const RAG_TRACK_FOLDERS: Record<AssistantTrack, string> = {
  ff: "F & F",
  private: "Private Offering",
};

export function resolveChunkTrack(metadata: ChunkMetadata): AssistantTrack | null {
  if (metadata.track === "ff" || metadata.track === "private") {
    return metadata.track;
  }
  for (const [track, folder] of Object.entries(RAG_TRACK_FOLDERS) as [
    AssistantTrack,
    string,
  ][]) {
    if (
      metadata.sourceFile === folder ||
      metadata.sourceFile.startsWith(`${folder}/`)
    ) {
      return track;
    }
  }
  return null;
}
