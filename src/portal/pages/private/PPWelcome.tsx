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

export function PPWelcome({ go, onBack, papp }) {
  const amt = Number(papp.amount || PRIVATE.minInvestment);
  const shares = Math.floor(amt / PRIVATE.pricePerShare);
  return (
    <Shell onBack={onBack}>
      <PPStep step={10} />
      <div style={{ paddingTop: 24, textAlign: "center" }}>
        <div style={{ fontSize: 44 }}>🏛</div>
        <Kicker color={C.teal}>Subscription Received</Kicker>
        <H size={30} accent={C.teal}>Thank You.</H>
        <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, margin: "12px 0 0" }}>
          {papp.fullName ? `${papp.fullName}, your` : "Your"} subscription to the Music Habitat
          Private Offering has been received. Once your accredited status is verified and funds
          clear, your {PRIVATE.shareClass} shares will be issued and your certificate delivered.
        </p>
      </div>

      <Card style={{ marginTop: 24, textAlign: "left", padding: "6px 16px" }}>
        {[
          ["Security", PRIVATE.shareClass],
          ["Your investment", `$${amt.toLocaleString()}`],
          ["Est. shares", `${shares.toLocaleString()} @ $${PRIVATE.pricePerShare.toFixed(2)}`],
          ["Accreditation", "Verification in progress"],
          ["What's next", "Verification → funds clear → shares issued"],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12,
            padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none",
            fontSize: 13 }}>
            <span style={{ color: C.textFaint }}>{k}</span>
            <span style={{ color: C.text, textAlign: "right", maxWidth: "60%" }}>{v}</span>
          </div>
        ))}
      </Card>

      {/* Stock certificate visual — Class B Preferred · General (priced track) */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 11, color: C.textFaint, letterSpacing: 1.5,
          textTransform: "uppercase", fontFamily: FONT_DISPLAY, textAlign: "center",
          marginBottom: 10 }}>
          Your Stock Certificate
        </div>
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}`,
          background: "#FBFAF6" }}>
          {/* BACKEND HOOK: swap to the Class B General certificate artwork when available.
              Shares the Class B Preferred certificate base; the class line below reads "General". */}
          <img src={STOCK_CERT_IMG} alt="Music Habitat Class B Preferred Stock Certificate — General"
            style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, textAlign: "center",
          marginTop: 8 }}>
          Class B Preferred · General. Issued upon close — final share count, certificate number,
          and issue date are completed when your subscription is accepted and verified.
        </div>
      </div>

      <Card style={{ marginTop: 14, borderColor: C.tealDim, display: "flex", gap: 12,
        alignItems: "flex-start" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>📩</span>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: C.textDim, margin: 0 }}>
          A member of the team will reach out to complete verification and confirm wire receipt.
          Questions? Email <span style={{ color: C.teal }}>brandon@musichabitat.com</span>.
        </p>
      </Card>

      <Btn variant="teal" onClick={() => go("pp_call")}>Next</Btn>
      <Btn variant="ghost" onClick={() => go("page1")}>Back to Portal Home</Btn>
    </Shell>
  );
}

// =============================================================================
// PP10 — Schedule the founder call (Private · Calendly hook)
// =============================================================================
