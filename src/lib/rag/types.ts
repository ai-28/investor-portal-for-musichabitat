export type AssistantTrack = "ff" | "private";

export type ChunkMetadata = {
  sourceFile: string;
  sourceUrl: string;
  page: number;
  chunkIndex: number;
  /** Offering track — set at ingest from folder (F & F vs Private Offering). */
  track: AssistantTrack;
};

export type IndexedChunk = {
  id: string;
  text: string;
  embedding: number[];
  metadata: ChunkMetadata;
};

export type RagIndex = {
  embeddingModel: string;
  embeddingDim: number;
  ingestedAt: string;
  chunks: IndexedChunk[];
};

export type RetrievedChunk = {
  text: string;
  metadata: ChunkMetadata;
  score: number;
};

export type SourceCitation = {
  filename: string;
  page?: number;
  url: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
