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

export function PPOverview({ go, onBack }) {
  const stats = [
    { icon: "💳", label: "Minimum", val: `$${PRIVATE.minInvestment.toLocaleString()}` },
    { icon: "🎯", label: "Allocation Target", val: PRIVATE.raiseTarget >= 1e6
      ? `$${(PRIVATE.raiseTarget / 1e6).toFixed(1)}M`
      : `$${Math.round(PRIVATE.raiseTarget / 1e3)}K` },
    { icon: "📜", label: "Instrument", val: PRIVATE.shareClass },
    { icon: "🏛", label: "Exemption", val: "Reg D · 506(c)" },
  ];
  return (
    <Shell onBack={onBack}>
      <PPStep step={2} />
      <div style={{ paddingTop: 12, textAlign: "center" }}>
        <div style={{ fontSize: 34 }}>🏛</div>
        <H size={30} accent={C.teal}>The Private Offering</H>
        <div style={{ color: C.textDim, fontSize: 13, letterSpacing: 1.5,
          textTransform: "uppercase", fontFamily: FONT_DISPLAY }}>
          Accredited Investors · Rule 506(c)
        </div>
      </div>

      <Card style={{ marginTop: 20, borderLeft: `3px solid ${C.teal}` }}>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: C.text, margin: 0 }}>
          The Private Offering is Music Habitat's <strong style={{ color: C.teal }}>accredited
          investor round</strong> — a direct purchase of priced{" "}
          <strong style={{ color: C.teal }}>{PRIVATE.shareClass}</strong> stock at a stated
          price per share, conducted under <strong>Rule 506(c) of Regulation D</strong>.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: C.textDim, margin: "12px 0 0" }}>
          Unlike the Friends &amp; Family Circle 35 (a 506(b) SAFE round), this track is open to
          accredited investors broadly — but every investor's accredited status must be{" "}
          <strong style={{ color: C.text }}>verified</strong>, and the investment is a direct,
          priced equity purchase rather than a convertible instrument.
        </p>
      </Card>

      {/* How this differs from the Circle 35 */}
      <Kicker color={C.teal}>How This Differs From the Circle 35</Kicker>
      <Card style={{ padding: "4px 16px" }}>
        {[
          ["Exemption", "506(b) — invite only, no advertising", "506(c) — solicitation allowed; status verified"],
          ["Who can invest", "Relationship-based; some non-accredited", "Accredited investors only (verified)"],
          ["Instrument", "SAFE → converts to Class B", "Priced Class B purchased directly"],
          ["Warrant", "3× warrant coverage", "None"],
          ["Guardian Badge", "Yes — Circle 35 honor", "Not applicable"],
          ["Minimum", "$500", `$${PRIVATE.minInvestment.toLocaleString()}`],
        ].map(([k, ff, pv], i, arr) => (
          <div key={k} style={{ padding: "11px 0",
            borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
            <div style={{ fontSize: 11, color: C.textFaint, textTransform: "uppercase",
              letterSpacing: 1, fontFamily: FONT_DISPLAY, marginBottom: 5 }}>{k}</div>
            <div style={{ display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.4 }}>
              <div style={{ flex: 1, color: C.textFaint }}>
                <span style={{ color: C.amberDim }}>F&amp;F · </span>{ff}
              </div>
              <div style={{ flex: 1, color: C.text }}>
                <span style={{ color: C.teal }}>Private · </span>{pv}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ textAlign: "center", marginBottom: 0 }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 10, color: C.textFaint, margin: "8px 0 4px",
              textTransform: "uppercase", letterSpacing: 1, fontFamily: FONT_DISPLAY }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.teal }}>{s.val}</div>
          </Card>
        ))}
      </div>

      {/* 506(c) verification notice */}
      <Card style={{ marginTop: 16, borderColor: C.tealDim, display: "flex", gap: 12,
        alignItems: "flex-start" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.teal }}>
            Accreditation will be verified
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.5, color: C.textDim, margin: "4px 0 0" }}>
            Because this is a 506(c) offering, the SEC requires the company to take reasonable
            steps to verify that each investor is accredited — typically via a third-party letter
            (CPA, attorney, or registered broker-dealer) or documentary review. Self-certification
            alone is not sufficient.
          </p>
        </div>
      </Card>

      <div style={{ marginTop: 18 }}>
        <Btn variant="teal" onClick={() => go("pp_docs")}>Review the Documents</Btn>
        <Btn variant="ghost" onClick={() => go("page1")}>Back to Portal Home</Btn>
      </div>
    </Shell>
  );
}

// =============================================================================
// PP2 — Private Document Center
// =============================================================================
