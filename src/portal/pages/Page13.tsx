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

export function Page13({ go, onBack, app }) {
  const openCalendly = () => {
    if (CALENDLY_URL) {
      window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
    } else {
      // BACKEND HOOK: set CALENDLY_URL above; until then, fall back to email.
      window.location.href =
        `mailto:brandon@musichabitat.com?subject=${encodeURIComponent("Circle 35 founder call — " + (app.fullName || "Guardian"))}`;
    }
  };
  return (
    <Shell step={13} onBack={onBack}>
      <div style={{ paddingTop: 24, textAlign: "center" }}>
        <div style={{ fontSize: 38 }}>📞</div>
        <Kicker color={C.teal}>One Last Thing</Kicker>
        <H size={28}>Talk With Brandon</H>
        <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6, margin: "10px 0 0" }}>
          Every Guardian gets a personal call with the founder. If you'd like one, schedule a
          time that works for you — or skip for now and book it later.
        </p>
      </div>

      <Card style={{ marginTop: 22, textAlign: "center", padding: "26px 20px" }}>
        <div style={{ fontSize: 26, marginBottom: 12 }}>🗓</div>
        <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6, margin: "0 0 18px" }}>
          Tap below to open Brandon's calendar and pick a time. It opens in a new tab so you
          won't lose your place here.
        </p>
        <Btn variant="amber" onClick={openCalendly}>Schedule With Brandon</Btn>
      </Card>

      <Btn variant="ghost" onClick={() => go("page1")}>Skip for Now</Btn>
    </Shell>
  );
}

// =============================================================================
// StepNav — compact progress indicator used across the flow pages
// =============================================================================
