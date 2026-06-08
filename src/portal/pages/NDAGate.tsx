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

import { ndaClauses, downloadNDA } from "@/portal/lib/nda";

export function NDAGate({ accent = C.amber, trackLabel = "this offering", onAccept, onBack }) {
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const today = new Date().toLocaleDateString("en-US",
    { year: "numeric", month: "long", day: "numeric" });
  const canProceed = name.trim().length >= 2 && agreed;
  const CLAUSES = ndaClauses(trackLabel);

  return (
    <Shell onBack={onBack}>
      <div style={{ paddingTop: 28, textAlign: "center" }}>
        <div style={{ fontSize: 32 }}>🔏</div>
        <Kicker color={accent}>Before You Continue</Kicker>
        <H size={26}>Non-Disclosure Agreement</H>
        <p style={{ color: C.textDim, fontSize: 13.5, lineHeight: 1.6, margin: "10px 0 0" }}>
          The materials ahead are confidential. Please read this agreement in full, then sign
          below to proceed.
        </p>
      </div>

      {/* Download */}
      <div style={{ marginTop: 16 }}>
        <Btn variant={accent === C.teal ? "teal" : "ghost"}
          onClick={() => downloadNDA(trackLabel, name.trim())}>
          ⬇ Download / Print NDA
        </Btn>
      </div>

      {/* Full agreement — renders inline and scrolls with the page (no inner scroll box) */}
      <Card style={{ marginTop: 14, padding: "4px 16px 12px" }}>
        <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase",
          letterSpacing: 1, fontFamily: FONT_DISPLAY, padding: "12px 0 2px" }}>
          Non-Disclosure Agreement
        </div>
        <p style={{ fontSize: 12, color: C.textDim, fontStyle: "italic", margin: "0 0 4px",
          lineHeight: 1.5 }}>
          A unilateral confidentiality agreement from you (the “Recipient”) to Music Habitat, Inc.
          (the “Company”).
        </p>
        {CLAUSES.map(([h, body], i) => (
          <div key={i} style={{ padding: "11px 0", borderTop: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 5 }}>{h}</div>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: C.textDim, margin: 0 }}>{body}</p>
          </div>
        ))}
      </Card>

      <Field label="Type your full legal name to sign" value={name} onChange={setName}
        placeholder="Jane Q. Investor" />
      <div style={{ fontSize: 11, color: C.textFaint, margin: "-6px 2px 14px" }}>
        Dated {today}. Your typed name is your electronic signature, as Recipient.
      </div>

      <Card onClick={() => setAgreed((a) => !a)} style={{ display: "flex", gap: 12,
        cursor: "pointer", alignItems: "flex-start" }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
          border: `1px solid ${agreed ? C.green : C.lineHi}`,
          background: agreed ? C.green : "transparent", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000" }}>
          {agreed ? "✓" : ""}
        </div>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: C.textDim }}>
          As Recipient, I have read and agree to this Non-Disclosure Agreement, and I understand
          the materials I am about to access are confidential and provided for my evaluation only.
        </span>
      </Card>

      <Btn variant={accent === C.teal ? "teal" : "amber"}
        onClick={() => canProceed && onAccept(name.trim())}
        disabled={!canProceed}>
        Agree &amp; Continue
      </Btn>
      {!canProceed && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          Type your full legal name and check the box to continue.
        </p>
      )}
    </Shell>
  );
}
