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
import { EXEC_SUMMARY, QA_PRIVATE } from "@/portal/data/content";
import { PRIVATE } from "@/portal/data/private-offering";
import { PPStep, PP_TOTAL } from "@/portal/ui/PPStep";
import { PHOTO_MAP, BRANDON_PHOTO } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";

export function PPAck({ go, onBack, packs, setPacks }) {
  const ITEMS = [
    ["speculative", "I understand this is a speculative, illiquid investment and I could lose my entire investment."],
    ["priced", "I understand I am purchasing priced Class B Preferred stock directly — not a convertible instrument — and the price reflects the company's current stated valuation."],
    ["noliquidity", "I understand there is no public market for these shares and resale is restricted."],
    ["accredited", "I confirm I am an accredited investor and consent to verification of my status as required under Rule 506(c)."],
    ["governance", "I have reviewed the Operating Agreement and the Subscription Agreement that govern this offering."],
    ["advisors", "I have had the opportunity to consult my own legal, financial, and tax advisors."],
  ];
  const allChecked = ITEMS.every(([k]) => packs[k]);
  return (
    <Shell onBack={onBack}>
      <PPStep step={7} />
      <div style={{ paddingTop: 12 }}>
        <Kicker color={C.teal}>Required</Kicker>
        <H size={26}>Risk Acknowledgements</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          Please confirm each statement before signing.
        </p>
      </div>

      {ITEMS.map(([k, label]) => (
        <Card key={k} onClick={() => setPacks((a) => ({ ...a, [k]: !a[k] }))} style={{
          display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
            border: `1px solid ${packs[k] ? C.green : C.lineHi}`,
            background: packs[k] ? C.green : "transparent", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000" }}>
            {packs[k] ? "✓" : ""}
          </div>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: C.textDim }}>{label}</span>
        </Card>
      ))}

      <Btn variant="teal" disabled={!allChecked} onClick={() => go("pp_sign")}>
        Continue to Signing
      </Btn>
      {!allChecked && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          Confirm all acknowledgements to continue.
        </p>
      )}
    </Shell>
  );
}

// =============================================================================
// PP6 — E-Signature (priced-stock closing set)
// =============================================================================
