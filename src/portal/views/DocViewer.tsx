"use client";

import { getDocSource, PDF_RENDER_IDS } from "@/portal/data/doc-config";
import { DOC_CENTER } from "@/portal/data/content";
import { PRIVATE } from "@/portal/data/private-offering";
import { resolveDocKey } from "@/portal/data/doc-aliases";
import { pdfSourceKey } from "@/portal/lib/pdf";
import type { OfferingType } from "@/lib/portal/db-types";
import { PrototypeView } from "@/portal/views/PrototypeView";
import { PDFDocViewer } from "@/portal/views/PDFDocViewer";
import { InPortalDocReader } from "@/portal/views/InPortalDocReader";

function docDisplayTitle(docId: string, key: string) {
  const row = [
    ...DOC_CENTER.company,
    ...DOC_CENTER.investor,
    ...PRIVATE.docs.company,
    ...PRIVATE.docs.investor,
  ].find((d) => d.id === docId || d.id === key);
  return row?.name ?? "Document";
}

export function DocViewer({
  docId,
  onBack,
  track = "friends_family",
}: {
  docId: string;
  onBack: () => void;
  track?: OfferingType;
}) {
  const key = resolveDocKey(docId);
  if (key === "prototype") return <PrototypeView onBack={onBack} />;

  const sourceKey = pdfSourceKey(docId);
  const src = getDocSource(track, sourceKey) || getDocSource(track, key);
  if (PDF_RENDER_IDS.has(docId) || PDF_RENDER_IDS.has(key) || src) {
    return (
      <PDFDocViewer
        docId={docId}
        title={docDisplayTitle(docId, key)}
        onBack={onBack}
        track={track}
      />
    );
  }
  return <InPortalDocReader docId={docId} onBack={onBack} track={track} />;
}


// =============================================================================
// PAGE 6 — Q&A + AI Investor Assistant (Claude API, claude-sonnet-4)
// =============================================================================
