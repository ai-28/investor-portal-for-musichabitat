"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell, TopBar } from "@/portal/ui/Shell";
import { Logo } from "@/portal/ui/Logo";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";

import { downloadTermSheetPDF, pdfSourceKey } from "@/portal/lib/pdf";
import { DOC_SOURCES } from "@/portal/data/doc-config";

export function PDFDocViewer({ docId, title, onBack }) {
  const src = DOC_SOURCES[pdfSourceKey(docId)] || "";

  return (
    <Shell onBack={onBack}>
      <div style={{ paddingTop: 16 }}>
        <Kicker>Official Document</Kicker>
        <H size={24}>{title}</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          The complete, executed version. Pinch to zoom; scroll to page through.
        </p>
      </div>

      {src ? (
        <>
          {/* Real PDF render. <iframe> is the most broadly-compatible mobile
              path (iOS Safari + Chrome both page through native PDFs). */}
          <div style={{
            width: "100%", height: "70vh", minHeight: 420,
            border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden",
            background: "#1a1a1a",
          }}>
            <iframe
              src={src + "#view=FitH"}
              title={title}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
          <Btn variant="amber" onClick={() => window.open(src, "_blank")}>
            Open / Download PDF
          </Btn>
        </>
      ) : (
        // No source wired yet — clean placeholder, not a broken frame.
        <Card style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{
            aspectRatio: "8.5/11", maxWidth: 220, margin: "0 auto 20px",
            background: C.cardHi, border: `1px dashed ${C.lineHi}`, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: C.textFaint, fontSize: 12, letterSpacing: 1,
              textTransform: "uppercase", fontFamily: FONT_DISPLAY }}>PDF</span>
          </div>
          <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.5, margin: "0 0 4px" }}>
            {title} renders here once the file is published.
          </p>
          <p style={{ color: C.textFaint, fontSize: 12 }}>
            {/* BACKEND HOOK: set DOC_SOURCES["{pdfSourceKey(docId)}"] */}
            Awaiting hosted PDF source — a generated summary is available below.
          </p>
          {/* Until the signed PDF is hosted, every investor doc still downloads:
              Exec Summary uses its rich generator; Term Sheet generates from terms. */}
          <div style={{ marginTop: 16 }}>
            <Btn variant="amber" onClick={() => {
              if (pdfSourceKey(docId) === "execsum") downloadExecSummaryPDF();
              else downloadTermSheetPDF();
            }}>Download PDF</Btn>
          </div>
        </Card>
      )}

      <Btn variant="ghost" onClick={onBack}>Back to Documents</Btn>
    </Shell>
  );
}

// =============================================================================
// CONTENT — in-portal readers (wired from in-session source material)
// Structured so each reader renders natively in the portal's design system.
// Financial figures use the CANONICAL model, not the deck's legacy numbers.
// =============================================================================
