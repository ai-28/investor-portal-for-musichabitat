import type { AssistantTrack, ChatMessage, RetrievedChunk } from "./types";
import { formatContextBlock } from "./retrieve";

const DISCLAIMERS =
  "Never give legal, tax, or investment advice. Direct investors to their own advisors and to the official documents in the Document Center. If the excerpts do not contain enough information, say so and point to brandon@musichabitat.com.";

const TRACK_CONTEXT: Record<AssistantTrack, string> = {
  ff: `The investor is viewing the Circle 35 Friends & Family offering (Rule 506(b)). Frame answers for this track when terms differ across offerings. This round may involve a SAFE, warrant coverage, Guardian Badge perks, and lower minimums. Do not assume document filenames indicate which offering a passage belongs to — rely on the excerpt content.`,
  private: `The investor is viewing the Private Offering (Rule 506(c)). Frame answers for this track when terms differ across offerings. This is generally a priced Class B Preferred stock purchase with accredited-investor verification — not the separate F&F SAFE/warrant round. Do not assume document filenames indicate which offering a passage belongs to — rely on the excerpt content.`,
};

export function buildSystemPrompt(track: AssistantTrack, chunks: RetrievedChunk[]): string {
  const context = formatContextBlock(chunks);

  return `You are the Music Habitat Investor Assistant. Answer concisely and factually about Music Habitat, StageBid, and the investment offerings.

${TRACK_CONTEXT[track]}

Rules:
- Answer ONLY using the document excerpts below. Do not invent terms, numbers, or dates.
- When excerpts describe multiple offerings with different terms, prefer content relevant to the investor's current track and explicitly note any conflicts.
- Cite sources inline using the filename from the excerpt, e.g. (MusicHabitat BusinessPlan.pdf).
- ${DISCLAIMERS}

Document excerpts:
${context}`;
}

export function trimHistory(messages: ChatMessage[], maxTurns = 6): ChatMessage[] {
  if (messages.length <= maxTurns * 2) return messages;
  return messages.slice(-maxTurns * 2);
}
