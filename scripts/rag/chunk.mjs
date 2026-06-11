import { createHash } from "crypto";

/** Split extracted document text into overlapping chunks for embedding. */

const DEFAULT_MAX = 900;
const DEFAULT_OVERLAP = 120;

/**
 * @param {string} text
 * @param {{ maxLen?: number; overlap?: number }} [opts]
 * @returns {string[]}
 */
export function chunkText(text, opts = {}) {
  const maxLen = opts.maxLen ?? DEFAULT_MAX;
  const overlap = opts.overlap ?? DEFAULT_OVERLAP;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\t/g, " ").trim();
  if (!normalized) return [];

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const chunks = [];
  let buffer = "";

  for (const para of paragraphs) {
    if (para.length > maxLen) {
      if (buffer) {
        chunks.push(buffer.trim());
        buffer = "";
      }
      chunks.push(...splitLong(para, maxLen, overlap));
      continue;
    }

    const candidate = buffer ? `${buffer}\n\n${para}` : para;
    if (candidate.length <= maxLen) {
      buffer = candidate;
    } else {
      if (buffer) chunks.push(buffer.trim());
      buffer = para;
    }
  }

  if (buffer) chunks.push(buffer.trim());

  return dedupeOverlaps(chunks, overlap);
}

/**
 * @param {string} text
 * @param {number} maxLen
 * @param {number} overlap
 */
function splitLong(text, maxLen, overlap) {
  const parts = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxLen, text.length);
    if (end < text.length) {
      const slice = text.slice(start, end);
      const lastBreak = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf(" "));
      if (lastBreak > maxLen * 0.4) end = start + lastBreak + 1;
    }
    parts.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return parts.filter(Boolean);
}

/** @param {string[]} chunks @param {number} overlap */
function dedupeOverlaps(chunks, overlap) {
  if (chunks.length <= 1) return chunks;
  const out = [chunks[0]];
  for (let i = 1; i < chunks.length; i++) {
    const prev = out[out.length - 1];
    const cur = chunks[i];
    if (prev.slice(-overlap) === cur.slice(0, overlap) && cur.length <= overlap + 20) continue;
    out.push(cur);
  }
  return out;
}

/**
 * @param {string} sourceFile
 * @param {number | null} page
 * @param {number} chunkIndex
 */
export function makeChunkId(sourceFile, page, chunkIndex) {
  return createHash("sha1")
    .update(`${sourceFile}:${page ?? 0}:${chunkIndex}`)
    .digest("hex");
}
