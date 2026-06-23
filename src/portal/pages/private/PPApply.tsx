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
import { applicationPatchForTrack, emptyApp } from "@/lib/portal/state";
import { patchPortalState } from "@/lib/portal/sync-client";

export function PPApply({ go, onBack, papp, setPapp }) {
  const set = (k) => (v) => setPapp((a) => ({ ...a, [k]: v }));
  const amt = Number(papp.amount || 0);
  const validAmt = amt >= PRIVATE.minInvestment;
  // accreditedBasis is an array (multi-select): the investor may select one or more.
  const basis = Array.isArray(papp.accreditedBasis) ? papp.accreditedBasis : [];
  const toggleBasis = (k) => setPapp((a) => {
    const cur = Array.isArray(a.accreditedBasis) ? a.accreditedBasis : [];
    return { ...a, accreditedBasis: cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k] };
  });
  // 506(c): investor must select at least one accreditation basis AND a verification method.
  const canSubmit = papp.fullName && papp.email && validAmt &&
    basis.length > 0 && papp.verifyMethod;

  const saveAndContinue = async () => {
    if (!canSubmit) return;
    try {
      await patchPortalState(applicationPatchForTrack("private", emptyApp, papp));
    } catch (err) {
      console.error("Failed to save private application", err);
    }
    await go("pp_reserve");
  };

  const BASES = [
    ["income",   "Income > $200K ($300K joint) in each of the last 2 years"],
    ["networth", "Net worth > $1M, excluding primary residence"],
    ["entity",   "Entity with > $5M in assets, or all equity owners accredited"],
    ["license",  "Hold a Series 7, 65, or 82 license in good standing"],
  ];
  const METHODS = [
    ["thirdparty", "Third-party letter (CPA, attorney, or broker-dealer)"],
    ["documents",  "Upload financial documents for review"],
    ["service",    "Use a verification service (e.g. Parallel Markets / VerifyInvestor)"],
    ["company",    "Company Review"],
  ];

  // Square checkbox for the multi-select accreditation basis.
  const Check = ({ active }) => (
    <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
      border: `1px solid ${active ? C.teal : C.lineHi}`,
      background: active ? C.teal : "transparent", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: 12, color: "#04252A" }}>
      {active ? "✓" : ""}
    </div>
  );

  const Radio = ({ active }) => (
    <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
      border: `2px solid ${active ? C.teal : C.lineHi}`, display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal }} />}
    </div>
  );

  return (
    <Shell onBack={onBack}>
      <PPStep step={5} />
      <div style={{ paddingTop: 12 }}>
        <Kicker color={C.teal}>Reserve Your Position</Kicker>
        <H size={26}>Investment Application</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          This begins your subscription. Nothing is binding until you sign and fund.
        </p>
      </div>

      <Field label="Full legal name" value={papp.fullName} onChange={set("fullName")} placeholder="Jane Q. Investor" />
      <Field label="Email" value={papp.email} onChange={set("email")} placeholder="jane@email.com" />
      <Field label="Phone" value={papp.phone} onChange={set("phone")} placeholder="(555) 555-5555" />

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, color: C.textFaint, textTransform: "uppercase",
          letterSpacing: 1, fontFamily: FONT_DISPLAY, marginBottom: 6 }}>Investment amount (USD)</label>
        <input value={papp.amount} onChange={(e) => set("amount")(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric" placeholder={String(PRIVATE.minInvestment)}
          style={{ width: "100%", background: C.card,
            border: `1px solid ${validAmt || !papp.amount ? C.line : C.red}`,
            borderRadius: 10, padding: "13px 14px", color: C.text, fontSize: 16, outline: "none",
            fontFamily: FONT_BODY, boxSizing: "border-box" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: C.textFaint }}>Minimum ${PRIVATE.minInvestment.toLocaleString()}</span>
          {papp.amount && !validAmt && <span style={{ fontSize: 11, color: C.red }}>Below minimum</span>}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {[2500, 10000, 25000, 50000, 100000].map((v) => (
            <button key={v} onClick={() => set("amount")(String(v))} style={{
              padding: "8px 12px", borderRadius: 20, cursor: "pointer", fontFamily: FONT_DISPLAY,
              fontSize: 12, background: String(v) === papp.amount ? C.teal : C.card,
              color: String(v) === papp.amount ? "#04252A" : C.textDim,
              border: `1px solid ${String(v) === papp.amount ? C.teal : C.line}` }}>
              ${v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Accreditation basis (506(c) — select one or more that apply) */}
      <Kicker color={C.teal}>I Qualify As Accredited Because…</Kicker>
      <div style={{ fontSize: 11, color: C.textFaint, margin: "-2px 4px 6px" }}>
        Select all that apply.
      </div>
      <Card style={{ padding: "4px 16px" }}>
        {BASES.map(([k, label], i, arr) => (
          <div key={k} onClick={() => toggleBasis(k)} style={{ display: "flex", gap: 10,
            padding: "12px 0", cursor: "pointer", alignItems: "flex-start",
            borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
            <Check active={basis.includes(k)} />
            <span style={{ fontSize: 13, lineHeight: 1.45,
              color: basis.includes(k) ? C.text : C.textDim }}>{label}</span>
          </div>
        ))}
      </Card>

      {/* Verification method */}
      <Kicker color={C.teal}>How We'll Verify (Required Under 506(c))</Kicker>
      <Card style={{ padding: "4px 16px" }}>
        {METHODS.map(([k, label], i, arr) => (
          <div key={k} onClick={() => set("verifyMethod")(k)} style={{ display: "flex", gap: 10,
            padding: "12px 0", cursor: "pointer", alignItems: "flex-start",
            borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
            <Radio active={papp.verifyMethod === k} />
            <span style={{ fontSize: 13, lineHeight: 1.45,
              color: papp.verifyMethod === k ? C.text : C.textDim }}>{label}</span>
          </div>
        ))}
        {/* BACKEND HOOK: integrate accreditation-verification provider; persist proof to investor record. */}
      </Card>
      <p style={{ fontSize: 11, color: C.textFaint, lineHeight: 1.5, margin: "2px 4px 0" }}>
        Verification is completed before your subscription is accepted. Music Habitat must retain
        evidence of accredited status for each 506(c) investor.
      </p>

      <Btn variant="teal" onClick={saveAndContinue}
        style={{ opacity: canSubmit ? 1 : 0.5 }}>
        Continue
      </Btn>
      {!canSubmit && (
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
          Complete name, email, a valid amount, an accreditation basis, and a verification method.
        </p>
      )}
    </Shell>
  );
}

// =============================================================================
// PP4 — Reserve Position (priced Class B summary)
// =============================================================================
