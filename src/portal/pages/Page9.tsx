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

import { usePortal } from "@/portal/PortalProvider";

export function Page9({ go, onBack, acks, setAcks }) {
  const { markApplicationSubmitted } = usePortal();
  const ITEMS = [
    ["speculative", "I understand this is a speculative, illiquid investment and I could lose my entire investment."],
    ["noInterest", "I understand the SAFE bears no interest and has no maturity date."],
    ["conversion", "I understand conversion requires a Qualified Financing of at least $500,000, which may never occur."],
    ["warrant", "I understand my warrant expires nine months from the grant date and is not renewable."],
    ["arbitration", "I have read the Jury Trial and Court Access Waiver and consent to binding arbitration in Montana or Louisiana."],
    ["advisors", "I have had the opportunity to consult my own legal, financial, and tax advisors."],
  ];
  const allChecked = ITEMS.every(([k]) => acks[k]);
  return (
    <Shell step={9} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
        <Kicker color={C.amber}>Required</Kicker>
        <H size={26}>Risk Acknowledgements</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          Please confirm each statement before signing.
        </p>
      </div>

      {ITEMS.map(([k, label]) => (
        <Card key={k} onClick={() => setAcks((a) => ({ ...a, [k]: !a[k] }))} style={{
          display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
            border: `1px solid ${acks[k] ? C.green : C.lineHi}`,
            background: acks[k] ? C.green : "transparent", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000" }}>
            {acks[k] ? "✓" : ""}
          </div>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: C.textDim }}>{label}</span>
        </Card>
      ))}

      <Btn
        variant="amber"
        onClick={() => {
          if (!allChecked) return;
          markApplicationSubmitted();
          go("page10");
        }}
        style={{ opacity: allChecked ? 1 : 0.5 }}
      >
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
// DocuSign — e-signature of the three closing instruments
// =============================================================================
