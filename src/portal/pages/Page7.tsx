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
import { appToPatch } from "@/lib/portal/state";
import { patchPortalState } from "@/lib/portal/sync-client";

import { skipProgressGates } from "@/portal/lib/demo";

export function Page7({ go, onBack, app, setApp }) {
  const set = (k) => (v) => setApp((a) => ({ ...a, [k]: v }));
  const amt = Number(app.amount || 0);
  const validAmt = amt >= 500 && amt <= 25000;
  const canSubmit = app.fullName && app.email && validAmt && app.accredited;

  const saveAndContinue = async () => {
    if (!skipProgressGates() && !canSubmit) return;
    try {
      await patchPortalState(appToPatch(app));
    } catch (err) {
      console.error("Failed to save application", err);
    }
    await go("page8");
  };

  return (
    <Shell step={7} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
        <Kicker>Reserve Your Position</Kicker>
        <H size={26}>Investment Application</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          This begins your subscription. Nothing is binding until you sign and fund.
        </p>
      </div>

      <Field label="Full legal name" value={app.fullName} onChange={set("fullName")} placeholder="Jane Q. Investor" />
      <Field label="Email" value={app.email} onChange={set("email")} type="text" placeholder="jane@email.com" />
      <Field label="Phone" value={app.phone} onChange={set("phone")} type="text" placeholder="(555) 555-5555" />

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, color: C.textFaint, textTransform: "uppercase",
          letterSpacing: 1, fontFamily: FONT_DISPLAY, marginBottom: 6 }}>Investment amount (USD)</label>
        <input value={app.amount} onChange={(e) => set("amount")(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric" placeholder="1000"
          style={{ width: "100%", background: C.card, border: `1px solid ${validAmt || !app.amount ? C.line : C.red}`,
            borderRadius: 10, padding: "13px 14px", color: C.text, fontSize: 16, outline: "none",
            fontFamily: FONT_BODY, boxSizing: "border-box" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: C.textFaint }}>Min $500 · Max $25,000</span>
          {app.amount && !validAmt && <span style={{ fontSize: 11, color: C.red }}>Outside allowed range</span>}
        </div>
        {/* Quick chips */}
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {[500, 1000, 2500, 10000, 25000].map((v) => (
            <button key={v} onClick={() => set("amount")(String(v))} style={{
              padding: "8px 12px", borderRadius: 20, cursor: "pointer", fontFamily: FONT_DISPLAY,
              fontSize: 12, background: String(v) === app.amount ? C.amber : C.card,
              color: String(v) === app.amount ? "#1A1206" : C.textDim,
              border: `1px solid ${String(v) === app.amount ? C.amber : C.line}` }}>
              ${v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <Card onClick={() => set("accredited")(!app.accredited)} style={{ display: "flex", gap: 12,
        cursor: "pointer", alignItems: "flex-start" }}>
        <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
          border: `1px solid ${app.accredited ? C.green : C.lineHi}`,
          background: app.accredited ? C.green : "transparent", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 12, color: "#000" }}>
          {app.accredited ? "✓" : ""}
        </div>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: C.textDim }}>
          I confirm I have a pre-existing relationship with a Music Habitat team member and I am
          completing the accreditation questions in the Subscription Agreement truthfully.
        </span>
      </Card>

      <Btn
        variant="amber"
        disabled={!skipProgressGates() && !canSubmit}
        onClick={saveAndContinue}
      >
        Continue
      </Btn>
      {!skipProgressGates() && !canSubmit && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          Complete name, email, a valid amount, and the confirmation to continue.
        </p>
      )}
    </Shell>
  );
}

// =============================================================================
// PAGE 8 — Reserve Position (summary before signing)
// =============================================================================
