import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import { createHash } from "crypto";
import { join, extname, relative } from "path";
import OpenAI from "openai";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { chunkText, makeChunkId } from "./chunk.mjs";

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, "public", "assets", "docs");
const DATA_DIR = join(ROOT, "data");
const INDEX_PATH = join(DATA_DIR, "rag-index.json");
const MANIFEST_PATH = join(DATA_DIR, "rag-manifest.json");
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const BATCH_SIZE = 64;

loadEnvFile(join(ROOT, ".env"));

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function fileHash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sourceUrl(filename) {
  return `/assets/docs/${encodeURIComponent(filename)}`;
}

/** @returns {string[]} */
function listDocFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...listDocFiles(full));
      continue;
    }
    const ext = extname(entry).toLowerCase();
    if (ext === ".pdf" || ext === ".docx") out.push(full);
  }
  return out.sort();
}

/** @returns {Promise<{ text: string; page: number | null }[]>} */
async function extractPdf(path) {
  const buffer = readFileSync(path);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = (result.text || "").trim();
    if (!text) return [];
    return [{ text, page: null }];
  } finally {
    await parser.destroy();
  }
}

/** @returns {Promise<{ text: string; page: number | null }[]>} */
async function extractDocx(path) {
  const result = await mammoth.extractRawText({ path });
  const text = (result.value || "").trim();
  if (!text) return [];
  return [{ text, page: null }];
}

/** @param {OpenAI} client @param {string[]} texts */
async function embedBatch(client, texts) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/** Optional: mirror index into a local Chroma server (chroma run --path ./data/chroma). */
async function syncToChroma(records) {
  const chromaUrl = process.env.CHROMA_URL;
  if (!chromaUrl) return;

  try {
    // Optional peer: npm install chromadb@^3 (not required for JSON-based RAG)
    const { ChromaClient } = await import("chromadb");
    const chroma = new ChromaClient({ path: chromaUrl });
    const name = "musichabitat_docs";
    try {
      await chroma.deleteCollection({ name });
    } catch {
      /* missing */
    }
    const collection = await chroma.createCollection({ name });
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await collection.add({
        ids: batch.map((r) => r.id),
        embeddings: batch.map((r) => r.embedding),
        documents: batch.map((r) => r.text),
        metadatas: batch.map((r) => r.metadata),
      });
    }
    console.log(`Synced ${records.length} chunk(s) to Chroma at ${chromaUrl}`);
  } catch (err) {
    console.warn(`Chroma sync skipped (${chromaUrl}):`, err.message);
  }
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    if (existsSync(INDEX_PATH)) {
      console.warn("OPENAI_API_KEY not set — skipping ingest, using existing rag-index.json");
      return;
    }
    console.error("OPENAI_API_KEY is required for rag:ingest");
    process.exit(1);
  }

  if (!existsSync(DOCS_DIR)) {
    console.error(`Docs directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }

  mkdirSync(DATA_DIR, { recursive: true });

  const openai = new OpenAI({ apiKey });
  /** @type {{ id: string; text: string; embedding?: number[]; metadata: Record<string, string | number> }[]} */
  const allRecords = [];
  const manifest = {
    embeddingModel: EMBEDDING_MODEL,
    files: {},
    totalChunks: 0,
    ingestedAt: new Date().toISOString(),
  };

  const files = listDocFiles(DOCS_DIR);
  console.log(`Found ${files.length} document(s) in public/assets/docs`);

  for (const filePath of files) {
    const sourceFile = relative(DOCS_DIR, filePath).replace(/\\/g, "/");
    const ext = extname(sourceFile).toLowerCase();
    const hash = fileHash(filePath);

    let segments;
    try {
      segments =
        ext === ".pdf" ? await extractPdf(filePath) : ext === ".docx" ? await extractDocx(filePath) : [];
    } catch (err) {
      console.warn(`  SKIP ${sourceFile}: extraction failed —`, err.message);
      manifest.files[sourceFile] = { hash, chunks: 0, error: String(err.message) };
      continue;
    }

    const fileRecords = [];
    for (const segment of segments) {
      const chunks = chunkText(segment.text);
      chunks.forEach((text, chunkIndex) => {
        fileRecords.push({
          id: makeChunkId(sourceFile, segment.page, chunkIndex),
          text,
          metadata: {
            sourceFile,
            sourceUrl: sourceUrl(sourceFile),
            page: segment.page ?? -1,
            chunkIndex,
          },
        });
      });
    }

    manifest.files[sourceFile] = {
      hash,
      chunks: fileRecords.length,
      chars: segments.reduce((n, s) => n + s.text.length, 0),
    };
    allRecords.push(...fileRecords);

    if (fileRecords.length === 0) {
      console.warn(`  WARN ${sourceFile}: no text extracted (scanned PDF?)`);
    } else {
      console.log(`  OK   ${sourceFile}: ${fileRecords.length} chunk(s)`);
    }
  }

  if (allRecords.length === 0) {
    console.error("No chunks produced — check PDF/DOCX extraction.");
    process.exit(1);
  }

  console.log(`Embedding ${allRecords.length} chunk(s) with ${EMBEDDING_MODEL}…`);

  for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
    const batch = allRecords.slice(i, i + BATCH_SIZE);
    const embeddings = await embedBatch(
      openai,
      batch.map((r) => r.text),
    );
    batch.forEach((record, j) => {
      record.embedding = embeddings[j];
    });
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, allRecords.length)}/${allRecords.length}\r`);
  }
  console.log("");

  const index = {
    embeddingModel: EMBEDDING_MODEL,
    embeddingDim: allRecords[0].embedding.length,
    ingestedAt: new Date().toISOString(),
    chunks: allRecords.map((r) => ({
      id: r.id,
      text: r.text,
      embedding: r.embedding,
      metadata: r.metadata,
    })),
  };

  writeFileSync(INDEX_PATH, JSON.stringify(index));
  manifest.totalChunks = allRecords.length;
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`Wrote ${allRecords.length} chunks to ${INDEX_PATH}`);
  await syncToChroma(allRecords);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
