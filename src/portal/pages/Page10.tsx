"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { Field } from "@/portal/ui/Field";
import { Countdown } from "@/portal/ui/Countdown";
import { BadgeMark } from "@/portal/ui/BadgeMark";
import { Avatar } from "@/portal/ui/Avatar";
import { StepNav } from "@/portal/ui/StepNav";
import { DocuSignMark } from "@/portal/ui/DocuSignMark";
import { GuardianBadge } from "@/portal/ui/GuardianBadge";
import { BrandonSignature } from "@/portal/ui/BrandonSignature";
import { EXEC_SUMMARY, REFERRERS, DOC_CENTER, QA } from "@/portal/data/content";
import { PHOTO_MAP, BRANDON_PHOTO } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";
import { achLabel, achErr } from "@/portal/data/ach-labels";
import { getDocusignSigningUrl } from "@/portal/lib/docusign";
import { patchPortalState } from "@/lib/portal/sync-client";

export function Page10({ go, onBack, signed, setSigned, app }) {
  const docs = DOCUSIGN.documents;
  const signedCount = docs.filter((d) => signed[d.id]).length;
  const allSigned = signedCount === docs.length;

  const signOne = async (docId) => {
    const url = await getDocusignSigningUrl(docId, app);
    if (url) { window.open(url, "_blank"); }
    // In the live integration, completion is confirmed via DocuSign Connect webhook.
    // Demo: mark signed locally so the flow is fully navigable without a backend.
    setSigned((s) => ({ ...s, [docId]: true }));
  };

  return (
    <Shell step={10} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DocuSignMark size={20} />
          <Kicker color={C.teal} >Secure E-Signature</Kicker>
        </div>
        <H size={26}>Sign Your Documents</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          {signedCount} of {docs.length} signed. Each opens in a secure signing session.
        </p>
      </div>

      {docs.map((d) => (
        <Card key={d.id} style={{ display: "flex", alignItems: "center", gap: 12,
          borderColor: signed[d.id] ? C.green : C.line }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: signed[d.id] ? C.green : C.cardHi, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14, color: signed[d.id] ? "#000" : C.textFaint }}>
            {signed[d.id] ? "✓" : "✍"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</div>
            <div style={{ fontSize: 11, color: signed[d.id] ? C.green : C.textFaint,
              textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>
              {signed[d.id] ? "Signed" : "Awaiting signature"}
            </div>
          </div>
          {!signed[d.id] && (
            <button onClick={() => signOne(d.id)} style={{ padding: "9px 16px", borderRadius: 8,
              background: C.teal, color: "#04252A", border: "none", fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: FONT_DISPLAY }}>Sign</button>
          )}
        </Card>
      ))}

      {!DOCUSIGN.enabled && (
        <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, marginTop: 4 }}>
          {/* BACKEND HOOK: set DOCUSIGN.enabled + createEnvelopeEndpoint */}
          Demo signing flow. Connect DocuSign to enable legally-binding e-signature with audit trail.
        </p>
      )}

      <Btn
        variant="amber"
        onClick={() => {
          if (!allSigned) return;
          patchPortalState({ application_status: "signed" }).catch(console.error);
          go("page11");
        }}
        style={{ opacity: allSigned ? 1 : 0.5 }}
      >
        Continue to Funding
      </Btn>
      {!allSigned && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          Sign all three documents to continue.
        </p>
      )}
    </Shell>
  );
}

// =============================================================================
// FUNDING — ACH / Wire / Check instructions
// =============================================================================
