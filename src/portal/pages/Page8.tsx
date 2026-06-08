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

export function Page8({ go, onBack, app }) {
  const amt = Number(app.amount || 1000);
  const convShares = Math.floor(amt / 1.0); // $1.00 at the cap
  const warrantShares = convShares * 3;
  return (
    <Shell step={8} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
        <Kicker>Confirm</Kicker>
        <H size={26}>Reserve Your Position</H>
      </div>

      <Card style={{ borderColor: C.amber, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase", letterSpacing: 1,
          fontFamily: FONT_DISPLAY }}>Your Investment</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 700, color: C.amber,
          margin: "6px 0" }}>${amt.toLocaleString()}</div>
        <div style={{ fontSize: 12, color: C.textDim }}>via SAFE → Class B Preferred</div>
      </Card>

      <Card style={{ padding: "4px 16px" }}>
        {[
          ["Instrument", "SAFE (Simple Agreement for Future Equity)"],
          ["Valuation cap", "$10,000,000 pre-money"],
          ["Price at cap", "$1.00 per share"],
          ["Est. conversion shares", `${convShares.toLocaleString()} Class B`],
          ["Discount", "5% (95% of next round)"],
          ["Warrant coverage", `3× → up to ${warrantShares.toLocaleString()} shares @ 95% FMV`],
          ["Warrant window", "9 months from grant"],
          ["Conversion trigger", "Qualified Financing ≥ $500,000"],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14,
            padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none",
            fontSize: 13 }}>
            <span style={{ color: C.textFaint }}>{k}</span>
            <span style={{ color: C.text, textAlign: "right", maxWidth: "62%" }}>{v}</span>
          </div>
        ))}
      </Card>

      <Card style={{ borderColor: C.amber, display: "flex", gap: 12, alignItems: "center" }}>
        <BadgeMark size={40} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.amber }}>2 of 35 positions reserved</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
            33 remaining in the Circle 35.
          </div>
        </div>
      </Card>

      <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5 }}>
        Share figures are estimates based on the $1.00 cap price and your stated amount. Final
        figures are governed by the executed SAFE and Warrant.
      </p>

      <Btn variant="amber" onClick={() => go("page9")}>Continue to Acknowledgements</Btn>
    </Shell>
  );
}

// =============================================================================
// PAGE 9 — Risk Acknowledgements (gate before signing)
// =============================================================================
