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
import { achLabel, achErr } from "@/portal/data/ach-labels";

export function PPReserve({ go, onBack, papp }) {
  const amt = Number(papp.amount || PRIVATE.minInvestment);
  const shares = Math.floor(amt / PRIVATE.pricePerShare);
  return (
    <Shell onBack={onBack}>
      <PPStep step={6} />
      <div style={{ paddingTop: 12 }}>
        <Kicker color={C.teal}>Confirm</Kicker>
        <H size={26}>Reserve Your Position</H>
      </div>

      <Card style={{ borderColor: C.teal, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 1,
          fontFamily: FONT_DISPLAY }}>Your Investment</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 700, color: C.teal,
          margin: "6px 0" }}>${amt.toLocaleString()}</div>
        <div style={{ fontSize: 12, color: C.textDim }}>direct purchase of {PRIVATE.shareClass}</div>
      </Card>

      <Card style={{ padding: "4px 16px" }}>
        {[
          ["Instrument", "Stock Purchase & Transfer Agreement"],
          ["Security", `${PRIVATE.shareClass} (priced)`],
          ["Price per share", `$${PRIVATE.pricePerShare.toFixed(2)}`],
          ["Est. shares purchased", `${shares.toLocaleString()} ${PRIVATE.shareClass}`],
          ["Exemption", "Rule 506(c) of Regulation D"],
          ["Accreditation", "Verified before acceptance"],
          ["Warrant", "None (F&F-only)"],
          ["Governing docs", "Operating + Stockholders' Agreement"],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14,
            padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none",
            fontSize: 13 }}>
            <span style={{ color: C.textFaint }}>{k}</span>
            <span style={{ color: C.text, textAlign: "right", maxWidth: "62%" }}>{v}</span>
          </div>
        ))}
      </Card>

      <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5 }}>
        Share figures are estimates based on the stated ${PRIVATE.pricePerShare.toFixed(2)} price
        per share and your stated amount. Final figures are governed by the executed Stock Purchase
        &amp; Transfer Agreement.
      </p>

      <Btn variant="teal" onClick={() => go("pp_ack")}>Continue to Acknowledgements</Btn>
    </Shell>
  );
}

// =============================================================================
// PP5 — Risk Acknowledgements (priced-stock / 506(c) variant)
// =============================================================================
