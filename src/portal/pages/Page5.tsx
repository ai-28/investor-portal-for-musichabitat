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

import { skipProgressGates } from "@/portal/lib/demo";

export function Page5({ go, onBack, read, markRead }) {
  const investorDocs = DOC_CENTER.investor;
  const readCount = investorDocs.filter((d) => read[d.id]).length;
  const allInvestorRead = readCount === investorDocs.length;
  const pct =
    investorDocs.length > 0
      ? Math.round((readCount / investorDocs.length) * 100)
      : 0;

  const DocRow = ({ d }) => (
    <div onClick={() => { markRead(d.id); go(`doc_view:${d.id}`); }} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "13px 0",
      borderBottom: `1px solid ${C.line}`, cursor: "pointer",
    }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0,
        border: `1px solid ${read[d.id] ? C.green : C.lineHi}`,
        background: read[d.id] ? C.green : "transparent", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000" }}>
        {read[d.id] ? "✓" : ""}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
        <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase",
          letterSpacing: 1, fontFamily: FONT_DISPLAY, marginTop: 2 }}>
          {d.action === "download" ? "View · Download" : "View only"}
        </div>
      </div>
      <span style={{ color: d.action === "download" ? C.amber : C.teal, fontSize: 18 }}>›</span>
    </div>
  );

  return (
    <Shell step={5} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
        <Kicker>Start Here</Kicker>
        <H size={26}>Investor Document Center</H>
      </div>

      <Card style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke={C.cardHi} strokeWidth="6" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={C.amber} strokeWidth="6"
              strokeDasharray={`${(pct / 100) * 175.9} 175.9`} strokeLinecap="round"
              transform="rotate(-90 32 32)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY,
            fontWeight: 700, fontSize: 15, color: C.amber }}>{pct}%</div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.textDim, textTransform: "uppercase",
            letterSpacing: 1, fontFamily: FONT_DISPLAY }}>Investor Readiness</div>
          <div style={{ fontSize: 14, color: C.text, marginTop: 4 }}>
            Keep goin' — you're doing great.
          </div>
        </div>
      </Card>

      <div className="portal-two-col-wide" style={{ marginTop: 8 }}>
        <div>
          <Kicker color={C.teal}>Company Information (optional)</Kicker>
          <Card style={{ padding: "2px 18px" }}>
            {DOC_CENTER.company.map((d) => <DocRow key={d.id} d={d} />)}
          </Card>
        </div>

        <div>
          <Kicker color={C.teal}>Investor Documents</Kicker>
          <Card style={{ padding: "2px 18px" }}>
            {DOC_CENTER.investor.map((d) => <DocRow key={d.id} d={d} />)}
          </Card>
        </div>
      </div>

      <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, margin: "4px 0 16px" }}>
        Progress tracks investor documents only (company materials are optional).
      </p>
      <Btn
        variant="amber"
        disabled={!skipProgressGates() && !allInvestorRead}
        onClick={() => go("page6")}
      >
        Continue
      </Btn>
      {!skipProgressGates() && !allInvestorRead && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          Open each investor document below to continue.
        </p>
      )}
    </Shell>
  );
}

// Full Executive Summary reader — public access, viewable + downloadable.
// NOTE: Page 1's "View Executive Summary" button routes here (doc_view:execsum
// is intercepted by the App router BEFORE DocViewer). The Page 5 Document Center
// "Executive Summary" row routes through DocViewer → PDFDocViewer (real PDF).
