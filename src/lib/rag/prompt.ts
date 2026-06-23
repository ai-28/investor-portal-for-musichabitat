import type { AssistantTrack, ChatMessage, RetrievedChunk } from "./types";
import { formatContextBlock } from "./retrieve";

const DISCLAIMERS =
  "Never give legal, tax, or investment advice. Direct investors to their own advisors and to the official documents in the Document Center. If the excerpts do not contain enough information, say so and point to brandon@musichabitat.com.";

const TRACK_CONTEXT: Record<AssistantTrack, string> = {
  ff: `The investor is viewing the Circle 35 Friends & Family offering (Rule 506(b)). All excerpts below are from the F&F document set only. This round may involve a SAFE, warrant coverage, Guardian Badge perks, and lower minimums.`,
  private: `The investor is viewing the Private Offering (Rule 506(c)). All excerpts below are from the Private Offering document set only. This is generally a priced Class B Preferred stock purchase with accredited-investor verification.`,
};

export function buildSystemPrompt(track: AssistantTrack, chunks: RetrievedChunk[]): string {
  const context = formatContextBlock(chunks);

  return `You are the Music Habitat Investor Assistant. Answer concisely and factually about Music Habitat, StageBid, and the investment offering.

${TRACK_CONTEXT[track]}

Rules:
- Answer ONLY using the document excerpts below. Do not invent terms, numbers, or dates.
- Cite sources inline using the filename from the excerpt, e.g. (MusicHabitat BusinessPlan.pdf).
- ${DISCLAIMERS}

Document excerpts:
${context}`;
}

export function trimHistory(messages: ChatMessage[], maxTurns = 6): ChatMessage[] {
  if (messages.length <= maxTurns * 2) return messages;
  return messages.slice(-maxTurns * 2);
}
