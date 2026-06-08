"use client";

import { PDF_RENDER_IDS } from "@/portal/data/doc-config";
import { resolveDocKey } from "@/portal/data/doc-aliases";
import { PrototypeView } from "@/portal/views/PrototypeView";
import { PDFDocViewer } from "@/portal/views/PDFDocViewer";
import { InPortalDocReader } from "@/portal/views/InPortalDocReader";

export function DocViewer({ docId, onBack }) {
  const key = resolveDocKey(docId);
  if (key === "prototype") return <PrototypeView onBack={onBack} />;
  // Term Sheet + Executive Summary → real PDF render path.
  if (PDF_RENDER_IDS.has(docId) || PDF_RENDER_IDS.has(key)) {
    const title = docId.startsWith("termsheet") || key === "term_sheet"
      ? "Term Sheet" : "Executive Summary";
    return <PDFDocViewer docId={docId} title={title} onBack={onBack} />;
  }
  // Everything else → in-portal reader (VERBATIM if present, else structured).
  return <InPortalDocReader docId={docId} onBack={onBack} />;
}


// =============================================================================
// PAGE 6 — Q&A + AI Investor Assistant (Claude API, claude-sonnet-4)
// =============================================================================
