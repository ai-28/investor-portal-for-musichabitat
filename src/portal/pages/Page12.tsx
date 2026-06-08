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

export function Page12({ go, onBack, app }) {
  return (
    <Shell step={12} onBack={onBack}>
      <div style={{ paddingTop: 30, textAlign: "center" }}>
        <GuardianBadge size={120} serial="XVII" />
        <Kicker color={C.amber}>Welcome to the Circle</Kicker>
        <H size={30} accent={C.amber}>You're In.</H>
        <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, margin: "12px 0 0" }}>
          {app.fullName ? `${app.fullName}, you` : "You"} are now a Guardian of the Stage — one of
          the founding 35. Your serialized badge has been reserved, and the founder will be in
          touch personally.
        </p>
      </div>

      {/* Stock certificate visual — Class B Preferred · Guardian */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 11, color: C.textFaint, letterSpacing: 1.5,
          textTransform: "uppercase", fontFamily: FONT_DISPLAY, textAlign: "center",
          marginBottom: 10 }}>
          Your Stock Certificate
        </div>
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}`,
          background: "#FBFAF6" }}>
          <img src={STOCK_CERT_IMG} alt="Music Habitat Class B Preferred Stock Certificate — Guardians of the Stage"
            style={{ width: "100%", display: "block" }} />
        </div>
        <div style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, textAlign: "center",
          marginTop: 8 }}>
          Issued upon close. Final share count, certificate number, and issue date are
          completed when your subscription is accepted.
        </div>
      </div>

      <Card style={{ marginTop: 26, textAlign: "left", padding: "6px 16px" }}>
        {[
          ["Guardian designation", "Reserved · finalizing on close"],
          ["Your position", `$${Number(app.amount || 1000).toLocaleString()} · SAFE → Class B`],
          ["Badge serial", "Assigned at close"],
          ["What's next", "Founder welcome + close confirmation"],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12,
            padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none",
            fontSize: 13 }}>
            <span style={{ color: C.textFaint }}>{k}</span>
            <span style={{ color: C.text, textAlign: "right", maxWidth: "60%" }}>{v}</span>
          </div>
        ))}
      </Card>

      <Btn variant="amber" onClick={() => go("page13")}>Next</Btn>
      <Btn variant="ghost" onClick={() => go("page1")}>Back to Portal Home</Btn>
    </Shell>
  );
}

// =============================================================================
// PAGE 13 — Schedule the founder call (Calendly hook)
// =============================================================================
// BACKEND HOOK: set to the founder's scheduling link (Calendly/Savvycal/etc.)
